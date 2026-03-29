#!/usr/bin/env python3
"""
co-dev v3.1 -- Multi-agent dev tool for Claude Code
Dispatches free tasks (specs, tests, docs) to Gemini.
Claude Code handles critical work (CTO, Backend, Frontend, Tech Lead).

Called by Claude Code internally — user doesn't need to run this directly.
"""
import sys
import io
import json
from pathlib import Path
from datetime import datetime

# Fix Windows cp1252 encoding for Thai/Unicode output
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

BASE_DIR = Path(__file__).parent


# ═══════════════════════════════════════════════════════
# PUBLIC API — Called by Claude Code via subprocess
# ═══════════════════════════════════════════════════════

def main():
    args = sys.argv[1:]

    if not args or args[0] in ("-h", "--help", "help"):
        print_help()
        return

    command = args[0]
    commands = {
        "spec": cmd_spec,        # Generate feature spec (PM + Doc Writer)
        "code": cmd_code,        # Generate boilerplate code (Backend/Frontend via Gemini)
        "test": cmd_test,        # Generate tests (QA agent)
        "review": cmd_review,    # Show last output for Claude Code to review
        "run": cmd_run,          # Raw pipeline run (advanced)
        "status": cmd_status,
        "history": cmd_history,
        "version": lambda _: print("co-dev v3.1.0"),
    }

    handler = commands.get(command)
    if handler:
        handler(args[1:])
    else:
        print(f"Unknown command: {command}")
        print_help()


# ── Simplified Commands ───────────────────────────────

def cmd_spec(args):
    """Generate feature spec via Gemini (PM + Doc Writer).

    Usage: python cli.py spec "AI Compose Reply"
    Claude Code calls this, reads output, then reviews as CTO.
    """
    if not args:
        print("Usage: python cli.py spec \"feature description\"")
        return

    task = args[0]
    from core.pipeline import Pipeline
    pipeline = Pipeline()

    print(f"\n{'='*60}")
    print(f"  co-dev spec -- Generating feature specification")
    print(f"  Feature: {task}")
    print(f"{'='*60}\n")

    results = {}

    # Only run Gemini agents (PM + Doc Writer) — CTO = Claude Code
    results["pm_spec"] = pipeline._run_agent("pm", task,
        pipeline.state_mgr.create_task(
            f"SPEC-{datetime.now().strftime('%Y%m%d%H%M')}", task, "spec"),
        instruction=f"Write a feature specification for: {task}\n"
                    f"Use the 10-section template format.\n"
                    f"Output markdown only.")

    results["docs"] = pipeline._run_agent("doc_writer", results["pm_spec"],
        pipeline.state_mgr.create_task(
            f"DOC-{datetime.now().strftime('%Y%m%d%H%M')}", task, "doc"),
        instruction=f"Based on this spec, create:\n"
                    f"1. A data flow diagram (mermaid sequenceDiagram)\n"
                    f"2. A CONTEXT_INDEX.yaml update entry\n\n"
                    f"Spec:\n{results['pm_spec'][:3000]}")

    # Save output
    output_path = _save_output(task, "spec", results)

    print(f"\n  Output: {output_path}")
    print(f"  Next: Claude Code reviews as CTO")
    return output_path


def cmd_code(args):
    """Generate boilerplate code via Gemini (Backend + Frontend).

    Usage: python cli.py code "feature spec or description"
    Gemini writes boilerplate, Claude Code reviews + refines.
    No comments in output — Claude Code reads code directly.
    """
    if not args:
        print("Usage: python cli.py code \"feature description or spec path\"")
        return

    task = args[0]

    # If arg is a file path (e.g., spec file), read it
    spec_content = task
    spec_path = Path(task)
    if spec_path.exists():
        spec_content = spec_path.read_text(encoding="utf-8")
        task = f"Code for {spec_path.name}"

    from core.pipeline import Pipeline
    pipeline = Pipeline()

    print(f"\n{'='*60}")
    print(f"  co-dev code -- Generating boilerplate via Gemini")
    print(f"  Feature: {task}")
    print(f"{'='*60}\n")

    results = {}
    state = pipeline.state_mgr.create_task(
        f"CODE-{datetime.now().strftime('%Y%m%d%H%M')}", task, "code")

    # Backend boilerplate (Gemini)
    results["backend"] = pipeline._run_agent("backend", spec_content, state,
        instruction="Generate boilerplate code for this feature.\n"
                    "Output ONLY code — no comments, no explanations, no markdown prose.\n"
                    "Structure:\n"
                    "### File: src/lib/repositories/[name]Repo.js\n"
                    "[repo code]\n"
                    "### File: src/app/api/[route]/route.js\n"
                    "[route code]\n"
                    "Rules: repository pattern, tenantId first param, console.error on catch, "
                    "NextResponse.json for responses.")

    # Frontend boilerplate (Gemini)
    results["frontend"] = pipeline._run_agent("frontend", spec_content, state,
        instruction="Generate boilerplate code for this feature.\n"
                    "Output ONLY code — no comments, no explanations, no markdown prose.\n"
                    "Structure:\n"
                    "### File: src/app/(dashboard)/[route]/page.jsx\n"
                    "[page code]\n"
                    "### File: src/components/[module]/[Name].jsx\n"
                    "[component code]\n"
                    "Rules: Tailwind, Lucide icons, can() for RBAC, 'use client' only when needed.")

    output_path = _save_output(task, "code", results)

    print(f"\n  Output: {output_path}")
    print(f"  Next: Claude Code reviews as Tech Lead")
    return output_path


def cmd_test(args):
    """Generate tests via Gemini (QA agent).

    Usage: python cli.py test "path/to/code.js"
    Claude Code calls this after writing code.
    """
    if not args:
        print("Usage: python cli.py test \"code description or file path\"")
        return

    task = args[0]

    # Read code file if path provided
    code_content = task
    code_path = Path(task)
    if code_path.exists():
        code_content = code_path.read_text(encoding="utf-8")
        task = f"Tests for {code_path.name}"

    from core.pipeline import Pipeline
    pipeline = Pipeline()

    print(f"\n{'='*60}")
    print(f"  co-dev test -- Generating tests via Gemini")
    print(f"  Target: {task}")
    print(f"{'='*60}\n")

    results = {}
    results["tests"] = pipeline._run_agent("qa", code_content,
        pipeline.state_mgr.create_task(
            f"TEST-{datetime.now().strftime('%Y%m%d%H%M')}", task, "test"),
        instruction="Write Vitest unit tests for the code above.\n"
                    "Mock Prisma, test tenantId isolation, test edge cases from gotchas.\n"
                    "Output complete test file ready to save.")

    output_path = _save_output(task, "test", results)

    print(f"\n  Output: {output_path}")
    print(f"  Next: Claude Code reviews as Tech Lead")
    return output_path


def cmd_review(args):
    """Show most recent output for Claude Code to review."""
    outputs_dir = BASE_DIR / "outputs"
    if not outputs_dir.exists():
        print("No outputs yet.")
        return

    files = sorted(outputs_dir.glob("*.md"), key=lambda f: f.stat().st_mtime, reverse=True)
    if not files:
        print("No outputs yet.")
        return

    latest = files[0]
    print(f"Latest: {latest.name}")
    print(f"{'='*60}")
    print(latest.read_text(encoding="utf-8"))


# ── Advanced / Legacy Commands ────────────────────────

def cmd_run(args):
    """Raw pipeline run (all phases). Advanced use."""
    if not args:
        print("Usage: python cli.py run \"task\" --phase doc|code|migrate|full")
        return

    task = args[0]
    phase = "doc"
    for i, arg in enumerate(args):
        if arg == "--phase" and i + 1 < len(args):
            phase = args[i + 1]

    from core.pipeline import Pipeline
    pipeline = Pipeline()
    results = pipeline.run(task, phase=phase)

    output_path = _save_output(task, phase, results)
    print(f"\n  Output saved: {output_path}")


def cmd_status(args=None):
    """Show current task status."""
    from core.state import StateManager
    sm = StateManager()
    state = sm.load_state()

    if not state:
        print("No active task.")
        return

    print(f"\n  Task:   {state.task_id}")
    print(f"  Status: {state.status.value}")
    print(f"  Phase:  {state.phase}")
    print(f"  Agent:  {state.current_agent or '-'}")
    print(f"  Steps:  {len(state.completed_steps)}")
    if state.completed_steps:
        for step in state.completed_steps[-5:]:
            print(f"    {step}")


def cmd_history(args=None):
    """Show recent history."""
    n = 20
    if args:
        try:
            n = int(args[0])
        except ValueError:
            pass

    from core.state import StateManager
    sm = StateManager()
    history = sm.get_recent_history(n)

    if not history:
        print("No history yet.")
        return

    print(f"\n  Recent ({len(history)} entries):\n")
    for entry in history:
        ts = entry.ts.split("T")[1][:8] if "T" in entry.ts else entry.ts
        model_tag = f" ({entry.model})" if entry.model else ""
        dur = f" {entry.duration_ms}ms" if entry.duration_ms else ""
        print(f"  {ts} [{entry.agent}] {entry.action}{model_tag}{dur}")
        if entry.detail:
            print(f"         {entry.detail[:80]}")


# ── Helpers ───────────────────────────────────────────

def _save_output(task: str, phase: str, results: dict) -> Path:
    """Save results to outputs/ folder."""
    output_dir = BASE_DIR / "outputs"
    output_dir.mkdir(exist_ok=True)

    filename = f"{phase.upper()}-{datetime.now().strftime('%Y%m%d%H%M')}.md"
    output_path = output_dir / filename

    lines = [
        f"# {task}\n",
        f"Phase: {phase}",
        f"Date: {datetime.now().isoformat()}",
        "---\n",
    ]
    for agent, result in results.items():
        lines.append(f"\n## {agent}\n\n{result}\n")

    output_path.write_text("\n".join(lines), encoding="utf-8")
    return output_path


def print_help():
    print("""
co-dev v3.1 -- Multi-Agent Dev Tool for Claude Code

  This tool is called BY Claude Code, not by the user directly.
  Claude Code dispatches free tasks to Gemini, then reviews the output.

Workflow:
  1. User tells Claude Code: "สร้าง feature spec สำหรับ AI Compose Reply"
  2. Claude Code runs: python cli.py spec "AI Compose Reply"
     -> Gemini (free) generates spec + docs
  3. Claude Code reads output + reviews as CTO
  4. Claude Code writes code (Backend/Frontend)
  5. Claude Code runs: python cli.py test "description"
     -> Gemini (free) generates tests
  6. Claude Code reviews tests as Tech Lead
  7. User approves -> commit

Commands:
  spec <feature>     Generate feature spec (PM + Doc Writer via Gemini)
  code <spec>        Generate boilerplate code (Backend + Frontend via Gemini)
  test <code>        Generate tests (QA via Gemini)
  review             Show latest output
  run <task> --phase Raw pipeline run (advanced)
  status             Show current task
  history [N]        Show last N entries
  version            Show version
  help               Show this help

Model Routing:
  Gemini Flash -> PM specs, QA tests, Doc Writer (FREE)
  Claude Code  -> CTO review, Backend, Frontend, Tech Lead (IN SESSION)
""")


if __name__ == "__main__":
    main()
