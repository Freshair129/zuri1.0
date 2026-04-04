#!/usr/bin/env python3
"""
Zuri: Sync Check — Docs Integrity
Usage: python scripts/sync-check.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent


def check_frontmatter(content: str) -> dict:
    """Extract YAML frontmatter fields."""
    m = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).splitlines():
        if ':' in line:
            k, _, v = line.partition(':')
            fm[k.strip()] = v.strip().strip('"').strip("'")
    return fm


def main():
    print("\n--- Zuri: Sync Check (Docs Integrity) ---\n")

    issues = []
    adr_count = 0
    spec_count = 0

    # --- Check 1: ADRs have valid frontmatter ---
    adr_dir = ROOT / "docs" / "decisions" / "adrs"
    if not adr_dir.exists():
        issues.append(("adr", "docs/decisions/adrs/", "Directory not found"))
    else:
        adr_files = sorted(f for f in adr_dir.iterdir()
                           if re.match(r"ADR-\d+", f.name) and f.suffix == ".md")
        adr_count = len(adr_files)
        for f in adr_files:
            try:
                content = f.read_text(encoding="utf-8")
                fm = check_frontmatter(content)
                missing = []
                if not fm.get("adr") and not fm.get("title"):
                    missing.append("title")
                if not fm.get("status"):
                    missing.append("status")
                if not fm.get("date"):
                    missing.append("date")
                if missing:
                    issues.append(("adr", f.name, f"Missing frontmatter: {', '.join(missing)}"))
            except Exception as e:
                issues.append(("adr", f.name, f"Failed to parse: {e}"))

    # --- Check 2: Feature specs have Status field ---
    specs_dir = ROOT / "docs" / "product" / "specs"
    if not specs_dir.exists():
        issues.append(("feature", "docs/product/specs/", "Directory not found"))
    else:
        spec_files = sorted(f for f in specs_dir.iterdir()
                            if f.name.startswith("FEAT") and f.suffix == ".md")
        spec_count = len(spec_files)
        for f in spec_files:
            try:
                content = f.read_text(encoding="utf-8")
                fm = check_frontmatter(content)
                has_status = fm.get("status") or re.search(r"\*\*Status:\*\*\s*\w+", content)
                if not has_status:
                    issues.append(("feature", f.name, "Missing Status field"))
            except Exception as e:
                issues.append(("feature", f.name, f"Failed to parse: {e}"))

    # --- Check 3: CHANGELOG.md LATEST pointer matches real file ---
    changelog_path = ROOT / "CHANGELOG.md"
    if not changelog_path.exists():
        issues.append(("changelog", "CHANGELOG.md", "File not found"))
    else:
        content = changelog_path.read_text(encoding="utf-8")
        m = re.search(r"\*\*LATEST:\*\*\s*(CL-\d{8}-\d{3})", content)
        if not m:
            issues.append(("changelog", "CHANGELOG.md", "No LATEST pointer found"))
        else:
            latest_id = m.group(1)
            latest_file = ROOT / "changelog" / f"{latest_id}.md"
            if not latest_file.exists():
                issues.append(("changelog", "CHANGELOG.md",
                               f"LATEST points to {latest_id} but changelog/{latest_id}.md not found"))

    # --- Check 4: handoff IMP files have required fields ---
    handoff_dir = ROOT / "docs" / "handoff"
    if handoff_dir.exists():
        imp_files = [f for f in handoff_dir.iterdir()
                     if f.name.startswith("IMP-") and f.suffix == ".md"]
        for f in imp_files:
            content = f.read_text(encoding="utf-8")
            fm = check_frontmatter(content)
            if not fm.get("status"):
                issues.append(("handoff", f.name, "Missing status field"))

    # --- Print summary ---
    print(f"  ADRs found:     {adr_count}  (docs/decisions/adrs/)")
    print(f"  Specs found:    {spec_count}  (docs/product/specs/)")
    print(f"  Issues:         {len(issues)}\n")

    if not issues:
        print("  PASS: All checks passed — docs are in sync\n")
        sys.exit(0)
    else:
        print("  Issues found:\n")
        for kind, file, msg in issues:
            print(f"    ! [{kind}] {file}: {msg}")
        print()
        sys.exit(1)


if __name__ == "__main__":
    main()
