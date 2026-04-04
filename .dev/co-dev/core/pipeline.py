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
from .retriever import ContextRetriever


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
        self.retriever = ContextRetriever(str(self.base_dir / "data/vector.db"))
        self._indexer = None  # lazy-loaded, cached per Pipeline instance

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

    def run(self, task: str, phase: str = "doc", inject_outputs: dict = None) -> dict:
        """
        Run the pipeline for a task.

        Args:
            task:           Description of what to do
            phase:          "doc", "code", "migrate", or "full"
            inject_outputs: {agent_name: pre_computed_output} — skip LLM for these agents.
                            e.g. {"cto": "<CTO review text>"} to use Claude Desktop as CTO.

        Returns:
            dict with results per agent
        """
        inject_outputs = inject_outputs or {}

        # Create task state
        task_id = f"TASK-{datetime.now().strftime('%Y%m%d%H%M')}"
        state = self.state_mgr.create_task(task_id, task, phase)
        results = {}

        print(f"\n{'='*60}")
        print(f"  co-dev v3.1 — {phase.upper()} phase")
        print(f"  Task: {task}")
        print(f"  ID:   {task_id}")
        if inject_outputs:
            print(f"  Injected: {', '.join(inject_outputs.keys())} (skipped LLM)")
        print(f"{'='*60}\n")

        try:
            if phase == "doc":
                results = self._run_doc_phase(state, task, inject_outputs)
            elif phase == "code":
                results = self._run_code_phase(state, task)
            elif phase == "migrate":
                results = self._run_migrate_phase(state, task)
            elif phase == "full":
                results = self._run_doc_phase(state, task, inject_outputs)
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

    def _run_doc_phase(self, state, task: str, inject_outputs: dict = None) -> dict:
        """PM -> CTO (gate) -> Doc Writer

        inject_outputs: {agent_name: pre_computed_output}
            Pass {"cto": "<your review>"} to skip CTO LLM call entirely.
            Useful when Claude Desktop acts as CTO manually.
        """
        inject_outputs = inject_outputs or {}
        results = {}
        _t = time.time()

        # 1. PM: Generate feature spec
        results["pm_spec"] = self._run_agent("pm", task, state,
            instruction=f"Write a feature specification for: {task}\n"
                        f"Use the 10-section template format.\n"
                        f"Output markdown only.",
            step=1, total=3, phase_start=_t)

        # 2. CTO: Review spec — use injected output if provided
        if "cto" in inject_outputs:
            results["cto_review"] = inject_outputs["cto"]
            print(f"\n  [INJECT] cto — using pre-computed output ({len(inject_outputs['cto'])} chars)")
        else:
            results["cto_review"] = self._run_agent("cto", results["pm_spec"], state,
                instruction=f"Review this feature spec:\n\n{results['pm_spec'][:3000]}\n\n"
                            f"Check:\n"
                            f"1. Is the spec complete? (data flow, API, roles, gotchas)\n"
                            f"2. Does this need an ADR? (schema change, new dependency, arch decision)\n"
                            f"3. Any gotchas from docs/gotchas/ that apply?\n"
                            f"Output: APPROVED / NEEDS_REVISION / ADR_REQUIRED + details",
                step=2, total=3, phase_start=_t)

        # 3. Doc Writer: Create flow diagram + update docs
        results["docs"] = self._run_agent("doc_writer", results["pm_spec"], state,
            instruction=f"Based on this spec, create:\n"
                        f"1. A data flow diagram (mermaid)\n"
                        f"2. Update docs/HOME.md if new docs created\n\n"
                        f"Spec:\n{results['pm_spec'][:3000]}",
            step=3, total=3, phase_start=_t)

        return results

    def _run_code_phase(self, state, task: str) -> dict:
        """Backend + Frontend -> QA -> Tech Lead"""
        results = {}
        spec = state.results.get("pm_spec", task)
        _t = time.time()

        # 1. Backend + Frontend (sequential for now, parallel later)
        results["backend"] = self._run_agent("backend", spec, state,
            instruction=f"Implement backend for:\n{spec[:3000]}\n\n"
                        f"Create: API routes (route.js) + repository (repo.js)\n"
                        f"Rules: repo pattern, tenantId, console.error('[Module]', error)",
            step=1, total=4, phase_start=_t)

        results["frontend"] = self._run_agent("frontend", spec, state,
            instruction=f"Implement frontend for:\n{spec[:3000]}\n\n"
                        f"Create: page.jsx + components\n"
                        f"Rules: Lucide icons, max 500 LOC, RBAC can(), Tailwind",
            step=2, total=4, phase_start=_t)

        # 2. QA: Write tests
        results["tests"] = self._run_agent("qa",
            f"Backend:\n{results['backend'][:2000]}\nFrontend:\n{results['frontend'][:2000]}",
            state,
            instruction="Write Vitest unit tests for the code above.\n"
                        "Mock Prisma, test tenantId isolation, test edge cases from gotchas.",
            step=3, total=4, phase_start=_t)

        # 3. Tech Lead: Review
        results["review"] = self._run_agent("tech_lead",
            f"Backend:\n{results['backend'][:2000]}\nTests:\n{results['tests'][:1000]}",
            state,
            instruction="Review this code for:\n"
                        "1. ADR compliance (verify-adr checklist)\n"
                        "2. NFR compliance (webhook <200ms, cache <500ms)\n"
                        "3. Security (no secrets, auth, validation)\n"
                        "Output: PASS / FAIL + issues list",
            step=4, total=4, phase_start=_t)

        return results

    def _run_migrate_phase(self, state, task: str) -> dict:
        """Migrator -> QA -> Tech Lead"""
        results = {}
        _t = time.time()

        results["migration_plan"] = self._run_agent("migrator", task, state,
            instruction=f"Plan migration for: {task}\n"
                        f"Read source from E:/ZURI-v1, map to {self.project_root} modular structure.\n"
                        f"Output: source files, target location, changes needed.",
            step=1, total=1, phase_start=_t)

        return results

    # ── Agent Runner ───────────────────────────────────────

    def _run_agent(self, agent_name: str, context: str, state, instruction: str = "",
                   step: int = 0, total: int = 0, phase_start: float = 0.0) -> str:
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
        
        # Context resolution (Phase A: Domain-Sliced Schema)
        raw_context_files = config.get("context_files", [])
        domain = config.get("domain", [])
        context_files = []
        
        slices_dir = self.project_root / "docs" / "schema-slices"
        
        for cf in raw_context_files:
            if "{domain}" in cf:
                if domain == "ALL":
                    if slices_dir.exists():
                        # Inject shared first, then others
                        shared_path = slices_dir / "shared.md"
                        if shared_path.exists():
                            context_files.append(str(shared_path.relative_to(self.project_root)))
                        for f in slices_dir.glob("*.md"):
                            if f.name != "shared.md":
                                context_files.append(str(f.relative_to(self.project_root)))
                elif isinstance(domain, list):
                    for d in domain:
                        context_files.append(cf.replace("{domain}", f"{d}.md"))
                elif isinstance(domain, str):
                    context_files.append(cf.replace("{domain}", f"{domain}.md"))
            else:
                context_files.append(cf)

        # --- Phase B: Hybrid RAG Retrieval (Vector + BM25/FTS5) ---
        rag_context = ""
        try:
            from .indexer import Indexer
            if self._indexer is None:          # cache — one Indexer per Pipeline
                self._indexer = Indexer(str(self.project_root))

            query = f"{agent_name} {instruction[:300]}"
            query_emb = self._indexer.embed(query)

            # domain_filter: agent's declared domain list (None = no filter)
            raw_domain = config.get("domain", None)
            domain_filter = None
            if isinstance(raw_domain, list):
                domain_filter = raw_domain
            # domain == "ALL" or str → no filter (agent sees everything)

            hits = self.retriever.retrieve(
                query_text=query,
                query_embedding=query_emb,
                top_k=8,
                domain_filter=domain_filter,
            )

            if hits:
                rag_context = "<retrieved_context>\n"
                for i, hit in enumerate(hits):
                    src = hit.get("source", "?")
                    dom = hit.get("domain", "")
                    rag_context += f"[{i+1}] {hit['file_path']} ({hit['tag']}"
                    rag_context += f", domain={dom}, via={src}):\n"
                    rag_context += f"{hit['content'][:800]}\n---\n"
                rag_context += "</retrieved_context>\n"
        except Exception as e:
            print(f"  [RAG] Warning: Retrieval skipped ({e})")
        # -----------------------------------------------------------

        full_prompt = ""
        if system_prompt:
            full_prompt += f"<system>\n{system_prompt}\n</system>\n\n"
        if rag_context:
            full_prompt += rag_context + "\n"
        if rules:
            full_prompt += f"<rules>\n{rules}\n</rules>\n\n"
        if instruction:
            full_prompt += f"<instruction>\n{instruction}\n</instruction>\n\n"
        full_prompt += f"<prior_output>\n{context[:4000]}\n</prior_output>"

        # Call LLM
        mode_str = " (Tool Mode)" if config.get("tool_use") else ""

        # ── Progress indicator ─────────────────────────────
        if total > 0:
            pct_done  = int(((step - 1) / total) * 100)
            filled    = pct_done // 5
            bar       = "█" * filled + "░" * (20 - filled)
            eta_str   = ""
            if step > 1 and phase_start > 0:
                elapsed   = time.time() - phase_start
                avg_per   = elapsed / (step - 1)
                remaining = avg_per * (total - step + 1)
                m, s      = divmod(int(remaining), 60)
                eta_str   = f" | ETA ~{m}m{s:02d}s" if m else f" | ETA ~{s}s"
            print(f"\n  [{bar}] {pct_done:3d}%  step {step}/{total}: {agent_name}{eta_str}")
        # ──────────────────────────────────────────────────

        print(f"  [{agent_name}] -> {model}{mode_str}...", end=" ", flush=True)
        self.state_mgr.mark_step(state, agent_name, "started")
        self.state_mgr.log_history(agent_name, "start", model)

        start = time.time()
        if config.get("tool_use"):
            from .tools import get_tool_definitions, ToolExecutor
            from .llm import call_with_tools

            tools_schema = get_tool_definitions()
            executor = ToolExecutor(str(self.project_root))

            response = call_with_tools(
                model=model,
                prompt=full_prompt,
                tools=tools_schema,
                tool_executor=executor.execute,
                max_rounds=5,
            )
            actual_model = model
        else:
            response, actual_model = call_with_fallback(model, full_prompt, context_files)

        duration_ms = int((time.time() - start) * 1000)
        self.state_mgr.log_history(agent_name, "done", actual_model, duration_ms=duration_ms)
        self.state_mgr.mark_step(state, agent_name, "done")
        print(f"done ({duration_ms}ms)")
        return response


class GateBlockedError(Exception):
    """Raised when an agent requires human approval before proceeding."""
    def __init__(self, gate_id: str, message: str):
        super().__init__(message)
        self.gate_id = gate_id