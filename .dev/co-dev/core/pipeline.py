"""
pipeline.py -- co-dev multi-agent pipeline
Dispatches free tasks to Gemini, Claude Code handles critical work.

Usage:
    pipeline = Pipeline()
    result = pipeline.run("AI Compose Reply feature", phase="doc")
    result = pipeline.run("Build inbox module", phase="code")
"""
import time
import yaml
from pathlib import Path
from datetime import datetime

from .llm import resolve_model, call_with_fallback
from .state import StateManager, TaskStatus
from .gates import GateManager


class Pipeline:
    """
    Orchestrate agents sequentially/parallel based on phase.

    Phases:
        doc:  PM -> CTO -> Doc Writer
        code: Backend + Frontend (parallel) -> QA -> Tech Lead
        migrate: Migrator -> QA -> Tech Lead
        full: doc -> code (end-to-end)
    """

    def __init__(self, project_root: str = None):
        self.base_dir = Path(__file__).parent.parent
        self.project_root = Path(project_root or str(self.base_dir.parent.parent))
        self.state_mgr = StateManager(str(self.base_dir))
        self.gate_mgr = GateManager(str(self.base_dir))

        # Load configs
        self.agents = self._load_yaml("config/agents.yaml")["agents"]
        self.gates = self._load_yaml("config/gates.yaml")["gates"]
        self.prompts = self._load_prompts()

    def _load_yaml(self, path: str) -> dict:
        full_path = self.base_dir / path
        with open(full_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)

    def _load_prompts(self) -> dict:
        """Load system prompts from config/prompts/*.md"""
        prompts = {}
        prompts_dir = self.base_dir / "config" / "prompts"
        if prompts_dir.exists():
            for f in prompts_dir.glob("*.md"):
                prompts[f.stem] = f.read_text(encoding="utf-8")
        return prompts

    def run(self, task: str, phase: str = "doc") -> dict:
        """
        Run the pipeline for a task.

        Args:
            task: Description of what to do
            phase: "doc", "code", "migrate", or "full"

        Returns:
            dict with results per agent
        """
        # Create task state
        task_id = f"TASK-{datetime.now().strftime('%Y%m%d%H%M')}"
        state = self.state_mgr.create_task(task_id, task, phase)
        results = {}

        print(f"\n{'='*60}")
        print(f"  co-dev v3.1 — {phase.upper()} phase")
        print(f"  Task: {task}")
        print(f"  ID:   {task_id}")
        print(f"{'='*60}\n")

        try:
            if phase == "doc":
                results = self._run_doc_phase(state, task)
            elif phase == "code":
                results = self._run_code_phase(state, task)
            elif phase == "migrate":
                results = self._run_migrate_phase(state, task)
            elif phase == "full":
                results = self._run_doc_phase(state, task)
                results.update(self._run_code_phase(state, task))

            state.results = {k: v[:200] + "..." if len(v) > 200 else v for k, v in results.items()}
            self.state_mgr.mark_done(state)

        except GateBlockedError as e:
            state.status = TaskStatus.BLOCKED
            self.state_mgr.save_state(state)
            print(f"\n  BLOCKED: {e}")
            print(f"  Approve with: co-dev approve {e.gate_id}")

        except Exception as e:
            state.status = TaskStatus.BLOCKED
            self.state_mgr.save_state(state)
            print(f"\n  ERROR: {e}")
            raise

        return results

    # ── Phase Runners ──────────────────────────────────────

    def _run_doc_phase(self, state, task: str) -> dict:
        """PM -> CTO (gate) -> Doc Writer"""
        results = {}

        # 1. PM: Generate feature spec
        results["pm_spec"] = self._run_agent("pm", task, state,
            instruction=f"Write a feature specification for: {task}\n"
                        f"Use the 10-section template format.\n"
                        f"Output markdown only.")

        # 2. CTO: Review spec + decide if ADR needed
        results["cto_review"] = self._run_agent("cto", results["pm_spec"], state,
            instruction=f"Review this feature spec:\n\n{results['pm_spec'][:3000]}\n\n"
                        f"Check:\n"
                        f"1. Is the spec complete? (data flow, API, roles, gotchas)\n"
                        f"2. Does this need an ADR? (schema change, new dependency, arch decision)\n"
                        f"3. Any gotchas from docs/gotchas/ that apply?\n"
                        f"Output: APPROVED / NEEDS_REVISION / ADR_REQUIRED + details")

        # 3. Doc Writer: Create flow diagram + update docs
        results["docs"] = self._run_agent("doc_writer", results["pm_spec"], state,
            instruction=f"Based on this spec, create:\n"
                        f"1. A data flow diagram (mermaid)\n"
                        f"2. Update CONTEXT_INDEX.yaml if new docs created\n\n"
                        f"Spec:\n{results['pm_spec'][:3000]}")

        return results

    def _run_code_phase(self, state, task: str) -> dict:
        """Backend + Frontend -> QA -> Tech Lead"""
        results = {}
        spec = state.results.get("pm_spec", task)

        # 1. Backend + Frontend (sequential for now, parallel later)
        results["backend"] = self._run_agent("backend", spec, state,
            instruction=f"Implement backend for:\n{spec[:3000]}\n\n"
                        f"Create: API routes (route.js) + repository (repo.js)\n"
                        f"Rules: repo pattern, tenantId, console.error('[Module]', error)")

        results["frontend"] = self._run_agent("frontend", spec, state,
            instruction=f"Implement frontend for:\n{spec[:3000]}\n\n"
                        f"Create: page.jsx + components\n"
                        f"Rules: Lucide icons, max 500 LOC, RBAC can(), Tailwind")

        # 2. QA: Write tests
        results["tests"] = self._run_agent("qa",
            f"Backend:\n{results['backend'][:2000]}\nFrontend:\n{results['frontend'][:2000]}",
            state,
            instruction="Write Vitest unit tests for the code above.\n"
                        "Mock Prisma, test tenantId isolation, test edge cases from gotchas.")

        # 3. Tech Lead: Review
        results["review"] = self._run_agent("tech_lead",
            f"Backend:\n{results['backend'][:2000]}\nTests:\n{results['tests'][:1000]}",
            state,
            instruction="Review this code for:\n"
                        "1. ADR compliance (verify-adr checklist)\n"
                        "2. NFR compliance (webhook <200ms, cache <500ms)\n"
                        "3. Security (no secrets, auth, validation)\n"
                        "Output: PASS / FAIL + issues list")

        return results

    def _run_migrate_phase(self, state, task: str) -> dict:
        """Migrator -> QA -> Tech Lead"""
        results = {}

        results["migration_plan"] = self._run_agent("migrator", task, state,
            instruction=f"Plan migration for: {task}\n"
                        f"Read source from ZURI-LEGACY, map to {self.project_root} modular structure.\n"
                        f"Output: source files, target location, changes needed.")

        return results

    # ── Agent Runner ───────────────────────────────────────

    def _run_agent(self, agent_name: str, context: str, state, instruction: str = "") -> str:
        """Run a single agent with proper model routing + gate checking."""
        config = self.agents.get(agent_name)
        if not config:
            return f"[ERROR] Unknown agent: {agent_name}"

        # Check human gate
        if config.get("human_gate"):
            action = f"run_{agent_name}"
            if self.gate_mgr.requires_approval(action, self.gates):
                gate_id = self.gate_mgr.request_approval(
                    agent=agent_name,
                    action=action,
                    reason=config.get("goal", ""),
                    detail=context[:200],
                )
                raise GateBlockedError(gate_id, f"{agent_name} requires Boss approval")

        # Resolve model
        model = resolve_model(config)

        # Build prompt
        system_prompt = self.prompts.get(agent_name, "")
        rules = "\n".join(f"- {r}" for r in config.get("rules", []))
        context_files = config.get("context_files", [])

        full_prompt = ""
        if system_prompt:
            full_prompt += f"<system>\n{system_prompt}\n</system>\n\n"
        if rules:
            full_prompt += f"<rules>\n{rules}\n</rules>\n\n"
        if instruction:
            full_prompt += f"<instruction>\n{instruction}\n</instruction>\n\n"
        full_prompt += f"<context>\n{context[:4000]}\n</context>"

        # Call LLM
        print(f"  [{agent_name}] -> {model}...", end=" ", flush=True)
        self.state_mgr.mark_step(state, agent_name, "started")
        self.state_mgr.log_history(agent_name, "start", model)

        start = time.time()
        response, actual_model = call_with_fallback(model, full_prompt, context_files)
        duration_ms = int((time.time() - start) * 1000)

        # Log
        status = "done" if not response.startswith("[ERROR]") else "error"
        self.state_mgr.mark_step(state, agent_name, status)
        self.state_mgr.log_history(agent_name, status, actual_model,
                                    detail=response[:200], duration_ms=duration_ms)

        if actual_model != model:
            print(f"(fallback -> {actual_model}) ", end="")

        print(f"{status} ({duration_ms}ms, {len(response)} chars)")

        return response


class GateBlockedError(Exception):
    """Raised when a human gate blocks execution."""
    def __init__(self, gate_id: str, message: str):
        self.gate_id = gate_id
        super().__init__(message)
