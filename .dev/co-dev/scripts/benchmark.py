"""
benchmark.py — Compare co-dev RAG+Tools vs Plain Injection

Usage:
    cd E:\zuri
    python .dev\co-dev\scripts\benchmark.py --task "Add LINE notification to enrollment" --phase doc

What it measures:
    A) co-dev pipeline (RAG + Tool Calling)   ← current implementation
    B) Plain injection (dump context files directly, single LLM call)

Metrics:
    - Wall-clock time (seconds)
    - Estimated token cost (input + output, from response headers if available)
    - Output quality score (Boss rates 1-5 manually after run)
    - Hallucination check: grep for known-bad patterns (model strings, non-existent files)

Output: benchmark/results/BENCH-YYYY-MM-DD-HH-MM.md
"""

import argparse
import json
import time
import os
import sys
from pathlib import Path
from datetime import datetime

# ── path setup ──────────────────────────────────────────
ROOT = Path(__file__).parent.parent.parent.parent  # E:\zuri
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.llm import call_with_fallback
from core.pipeline import Pipeline


# ── Hallucination checks ─────────────────────────────────
# Patterns that should NOT appear in output (common hallucination signals)
BAD_PATTERNS = [
    "claude-3",           # stale model name
    "gpt-4",              # wrong model family
    "mongoose",           # wrong ORM (we use Prisma)
    "express.js",         # wrong framework (Next.js App Router)
    "useEffect(async",    # known React anti-pattern
    "process.env.SECRET", # raw secret access (should use config)
    "SELECT * FROM",      # raw SQL (should use Prisma)
    "Promise.all([",      # should be Promise.allSettled (G-META-05)
]

GOOD_PATTERNS = [
    "tenantId",           # multi-tenant check
    "console.error",      # error logging check
    "getPrisma",          # repo pattern check
]


def check_hallucinations(text: str) -> dict:
    """Scan output for known bad patterns."""
    found_bad  = [p for p in BAD_PATTERNS  if p.lower() in text.lower()]
    found_good = [p for p in GOOD_PATTERNS if p.lower() in text.lower()]
    score = max(0, 10 - len(found_bad) * 2) + min(3, len(found_good))
    return {
        "bad_patterns":  found_bad,
        "good_patterns": found_good,
        "auto_score":    min(10, score),  # 0–10
    }


def estimate_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token."""
    return len(text) // 4


# ── Plan B: Plain Injection ───────────────────────────────

PLAIN_CONTEXT_FILES = [
    "docs/schema-slices/shared.md",
    "docs/schema-slices/inbox.md",
    "docs/schema-slices/crm.md",
    "docs/gotchas/README.md",
    "docs/decisions/adrs/ADR-056-multi-tenant.md",
    "docs/decisions/adrs/ADR-068-rbac.md",
]

PLAIN_PROMPT_TEMPLATE = """You are a senior engineer for Zuri (AI Business Platform for Thai SMEs).

<instruction>
Write a feature specification for: {task}
Use the 10-section template format (Overview, Goals, User Stories, Data Model, API, UI, Roles, Edge Cases, NFRs, Open Questions).
Output markdown only.
</instruction>

<context_files>
{context}
</context_files>
"""

def run_plain_injection(task: str, model: str = "claude-sonnet") -> dict:
    """Run a single-call plain injection (no RAG, no tools)."""
    # Build context block from files
    context_parts = []
    for fpath in PLAIN_CONTEXT_FILES:
        full = ROOT / fpath
        if full.exists():
            content = full.read_text(encoding="utf-8")
            if len(content) > 5000:
                content = content[:5000] + "\n... (truncated)"
            context_parts.append(f"--- {fpath} ---\n{content}")
        else:
            context_parts.append(f"--- {fpath} --- [NOT FOUND]")

    context = "\n\n".join(context_parts)
    prompt  = PLAIN_PROMPT_TEMPLATE.format(task=task, context=context)

    t0       = time.time()
    response, actual_model = call_with_fallback(model, prompt)
    duration = time.time() - t0

    return {
        "method":        "plain_injection",
        "model":         actual_model,
        "duration_s":    round(duration, 1),
        "input_tokens":  estimate_tokens(prompt),
        "output_tokens": estimate_tokens(response),
        "output":        response,
        "hallucination": check_hallucinations(response),
    }


# ── Plan A: co-dev RAG+Tools ─────────────────────────────

def run_codev(task: str, phase: str = "doc") -> dict:
    """Run the full co-dev pipeline and collect metrics."""
    pipeline  = Pipeline(str(ROOT))
    t0        = time.time()
    results   = pipeline.run(task, phase=phase)
    duration  = time.time() - t0

    # For doc phase, PM spec is the primary output to evaluate
    primary_output = results.get("pm_spec", results.get("migration_plan", ""))
    all_output     = "\n\n".join(str(v) for v in results.values())

    return {
        "method":        "codev_rag_tools",
        "phase":         phase,
        "duration_s":    round(duration, 1),
        "input_tokens":  0,   # hard to measure across multiple calls
        "output_tokens": estimate_tokens(all_output),
        "output":        primary_output,
        "all_outputs":   {k: v[:500] + "..." if len(v) > 500 else v for k, v in results.items()},
        "hallucination": check_hallucinations(all_output),
    }


# ── Report Writer ─────────────────────────────────────────

def write_report(task: str, phase: str, plan_a: dict, plan_b: dict) -> Path:
    """Write a markdown benchmark report."""
    stamp      = datetime.now().strftime("%Y-%m-%d-%H-%M")
    report_dir = ROOT / ".dev" / "co-dev" / "benchmark" / "results"
    report_dir.mkdir(parents=True, exist_ok=True)
    report_path = report_dir / f"BENCH-{stamp}.md"

    ha = plan_a["hallucination"]
    hb = plan_b["hallucination"]

    # Time ratio
    if plan_b["duration_s"] > 0:
        ratio = plan_a["duration_s"] / plan_b["duration_s"]
        time_note = f"co-dev is **{ratio:.1f}x slower**" if ratio > 1 else f"co-dev is **{ratio:.1f}x faster**"
    else:
        time_note = "N/A"

    lines = [
        f"# Benchmark: {stamp}",
        f"",
        f"**Task:** {task}  ",
        f"**Phase:** {phase}",
        f"",
        f"---",
        f"",
        f"## Results Summary",
        f"",
        f"| Metric | co-dev RAG+Tools | Plain Injection |",
        f"|--------|-----------------|-----------------|",
        f"| Wall time | {plan_a['duration_s']}s | {plan_b['duration_s']}s |",
        f"| Output tokens (est.) | {plan_a['output_tokens']} | {plan_b['output_tokens']} |",
        f"| Auto quality score | {ha['auto_score']}/13 | {hb['auto_score']}/13 |",
        f"| Bad patterns found | {', '.join(ha['bad_patterns']) or 'none'} | {', '.join(hb['bad_patterns']) or 'none'} |",
        f"| Good patterns found | {', '.join(ha['good_patterns']) or 'none'} | {', '.join(hb['good_patterns']) or 'none'} |",
        f"| Model used | {plan_a.get('model', plan_a['phase'] + ' pipeline')} | {plan_b['model']} |",
        f"",
        f"**Time:** {time_note}",
        f"",
        f"---",
        f"",
        f"## Manual Quality Rating",
        f"",
        f"> Boss: rate each output 1–5 and fill in below",
        f"",
        f"- co-dev RAG+Tools: **__ / 5**",
        f"- Plain Injection:  **__ / 5**",
        f"",
        f"Notes: _(what was better/worse?)_",
        f"",
        f"---",
        f"",
        f"## co-dev Output (PM Spec)",
        f"",
        f"```markdown",
        plan_a["output"][:3000] + ("..." if len(plan_a["output"]) > 3000 else ""),
        f"```",
        f"",
        f"---",
        f"",
        f"## Plain Injection Output",
        f"",
        f"```markdown",
        plan_b["output"][:3000] + ("..." if len(plan_b["output"]) > 3000 else ""),
        f"```",
    ]

    report_path.write_text("\n".join(lines), encoding="utf-8")
    return report_path


# ── CLI ───────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="co-dev benchmark: RAG vs plain injection")
    parser.add_argument("--task",  required=True, help="Task description")
    parser.add_argument("--phase", default="doc",  help="Pipeline phase (doc/code)")
    parser.add_argument("--model", default="claude-sonnet", help="Model for plain injection")
    parser.add_argument("--plain-only", action="store_true", help="Run only plain injection (faster)")
    parser.add_argument("--codev-only", action="store_true", help="Run only co-dev pipeline")
    args = parser.parse_args()

    print(f"\n{'='*60}")
    print(f"  BENCHMARK: {args.task}")
    print(f"  Phase: {args.phase} | Model (plain): {args.model}")
    print(f"{'='*60}\n")

    plan_a = None
    plan_b = None

    if not args.plain_only:
        print("── Plan A: co-dev RAG+Tools ──")
        plan_a = run_codev(args.task, args.phase)
        print(f"  Done: {plan_a['duration_s']}s | auto-score: {plan_a['hallucination']['auto_score']}/13")

    if not args.codev_only:
        print("\n── Plan B: Plain Injection ──")
        plan_b = run_plain_injection(args.task, args.model)
        print(f"  Done: {plan_b['duration_s']}s | auto-score: {plan_b['hallucination']['auto_score']}/13")

    if plan_a and plan_b:
        report = write_report(args.task, args.phase, plan_a, plan_b)
        print(f"\n  Report: {report}")
        print(f"\n  Next: open report, rate outputs 1-5, save findings")
    elif plan_a:
        print(f"\n  co-dev tokens (est.): {plan_a['output_tokens']}")
        print(f"  Auto-score: {plan_a['hallucination']['auto_score']}/13")
        print(f"  Bad patterns: {plan_a['hallucination']['bad_patterns'] or 'none'}")
    elif plan_b:
        print(f"\n  Plain tokens (est.): {plan_b['output_tokens']}")
        print(f"  Auto-score: {plan_b['hallucination']['auto_score']}/13")
        print(f"  Bad patterns: {plan_b['hallucination']['bad_patterns'] or 'none']}")


if __name__ == "__main__":
    main()
