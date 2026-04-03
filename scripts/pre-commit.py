#!/usr/bin/env python3
"""
Zuri: Pre-commit Checks
Usage: python scripts/pre-commit.py

Checks staged files for common Zuri gotchas:
  BLOCK — must fix before commit
  WARN  — review before proceeding
"""

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent


def get_staged_files() -> list[str]:
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=True,
        )
        return [f.strip() for f in result.stdout.splitlines() if f.strip()]
    except subprocess.CalledProcessError:
        return []


def read_file(path: str) -> str | None:
    try:
        return (ROOT / path).read_text(encoding="utf-8")
    except Exception:
        return None


def main():
    print("\n--- Zuri: Pre-commit Checks ---\n")

    staged = get_staged_files()
    if not staged:
        print("  No staged files to check.")
        sys.exit(0)

    print(f"  Checking {len(staged)} staged file(s)...\n")

    blocks: list[str] = []
    warns: list[str] = []

    # --- Check 1: schema.prisma staged → ADR required ---
    if any("prisma/schema.prisma" in f for f in staged):
        warns.append("prisma/schema.prisma staged — ADR required for schema changes")

    # --- Check 2: Misplaced specs (wrong folder) ---
    for f in staged:
        if "docs/product/features/" in f and f.endswith(".md"):
            blocks.append(f"{f} — specs must live in docs/product/specs/ (FEAT-{{SLUG}}.md)")

    # --- Check 3: Misplaced ADRs ---
    for f in staged:
        if "docs/adr/" in f and f.endswith(".md"):
            blocks.append(f"{f} — ADRs must live in docs/decisions/adrs/")

    # --- Check 4: .jsx/.js files > 500 LOC ---
    for f in staged:
        if f.endswith((".jsx", ".js")):
            content = read_file(f)
            if content:
                lines = len(content.splitlines())
                if lines > 500:
                    warns.append(f"{f} has {lines} lines (> 500) — consider splitting (ADR-066)")

    # --- Check 5: getPrisma() in API routes ---
    for f in staged:
        if f.startswith("src/app/api/"):
            content = read_file(f)
            if content and "getPrisma" in content:
                blocks.append(f"{f} contains getPrisma() — use repository pattern instead")

    # --- Check 6: console.error without [ModuleName] ---
    for f in staged:
        if f.endswith((".js", ".jsx", ".ts")):
            content = read_file(f)
            if not content:
                continue
            for i, line in enumerate(content.splitlines(), 1):
                if re.search(r"console\.error\s*\(", line):
                    if not re.search(r"console\.error\s*\(\s*['\"`]\[", line):
                        warns.append(f"{f}:{i} — console.error missing [ModuleName] prefix")

    # --- Check 7: Workers missing throw error ---
    for f in staged:
        if "src/app/api/workers/" in f:
            content = read_file(f)
            if content and "catch" in content and "throw error" not in content:
                warns.append(f"{f} — worker catch block missing 'throw error' (QStash won't retry)")

    # --- Check 8: tenantId in repository functions ---
    for f in staged:
        if "src/lib/repositories/" in f:
            content = read_file(f)
            if content:
                # Check functions that query DB but don't have tenantId
                if "prisma." in content and "tenantId" not in content and "tenant_id" not in content:
                    warns.append(f"{f} — repository functions may be missing tenantId (G-MT-01)")

    # --- Print results ---
    for msg in blocks:
        print(f"  x BLOCK: {msg}")
    for msg in warns:
        print(f"  ! WARN:  {msg}")

    if not blocks and not warns:
        print("  PASS: All pre-commit checks passed\n")
        sys.exit(0)

    print()
    if blocks:
        print(f"  BLOCKED: {len(blocks)} issue(s) must be fixed before commit\n")
        sys.exit(1)
    else:
        print(f"  WARNING: {len(warns)} warning(s) — review before proceeding\n")
        sys.exit(2)


if __name__ == "__main__":
    main()
