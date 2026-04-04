#!/usr/bin/env python3
"""
Zuri: Verify Feature Spec — ตรวจ spec ครบก่อน implement
Usage: python scripts/verify-flow.py docs/product/specs/FEAT05-crm.md
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """Return (frontmatter_dict, body_text)."""
    m = re.match(r'^---\n(.*?)\n---\n?(.*)', content, re.DOTALL)
    if not m:
        return {}, content
    fm = {}
    for line in m.group(1).splitlines():
        if ':' in line:
            k, _, v = line.partition(':')
            v = v.strip().strip('"').strip("'")
            # handle list values: [a, b]
            if v.startswith('['):
                v = [x.strip().strip('"') for x in v.strip('[]').split(',') if x.strip()]
            fm[k.strip()] = v
    return fm, m.group(2)


def check(label: str, status: str, detail: str) -> dict:
    return {"label": label, "status": status, "detail": detail}


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/verify-flow.py <spec-path>")
        print("  e.g. python scripts/verify-flow.py docs/product/specs/FEAT05-crm.md")
        sys.exit(1)

    spec_path = Path(sys.argv[1])
    if not spec_path.is_absolute():
        spec_path = ROOT / spec_path

    print("\n--- Zuri: Verify Feature Spec ---\n")

    if not spec_path.exists():
        print(f"  File not found: {sys.argv[1]}")
        print("  Hint: path relative to project root, e.g. docs/product/specs/FEAT05-crm.md")
        sys.exit(1)

    content = spec_path.read_text(encoding="utf-8")
    fm, body = parse_frontmatter(content)

    results = []
    critical_fail = False

    # --- Check 1: Status + Author fields ---
    has_status = fm.get("status") or re.search(r"\*\*Status:\*\*\s*\w+", body)
    has_author = fm.get("author") or re.search(r"\*\*Author:\*\*", body)
    missing = []
    if not has_status:
        missing.append("Status")
    if not has_author:
        missing.append("Author")
    if not missing:
        results.append(check("Frontmatter", "pass", "All required fields present"))
    else:
        results.append(check("Frontmatter", "fail", f"Missing: {', '.join(missing)}"))
        critical_fail = True

    # --- Check 2: Data Flow section ---
    if re.search(r"## 4\. Data Flow|## Data Flow", body, re.IGNORECASE):
        results.append(check("Data Flow", "pass", "Section found"))
    else:
        results.append(check("Data Flow", "fail", "Missing ## Data Flow section"))
        critical_fail = True

    # --- Check 3: Feature Breakdown / Overview ---
    if re.search(r"## [13]\. (Feature Breakdown|Overview)", body, re.IGNORECASE):
        results.append(check("Feature Breakdown / Overview", "pass", "Section found"))
    else:
        results.append(check("Feature Breakdown / Overview", "fail", "Missing section"))
        critical_fail = True

    # --- Check 4: Roles & Permissions ---
    if re.search(r"## 5\. Roles|## Roles\s*[&and]*\s*Permissions", body, re.IGNORECASE):
        results.append(check("Roles & Permissions", "pass", "Section found"))
    else:
        results.append(check("Roles & Permissions", "warn", "No roles section defined"))

    # --- Check 5: Schema changes → ADR required ---
    mentions_schema = bool(re.search(r"schema|prisma|migration|model\s+\w+", body, re.IGNORECASE))
    if mentions_schema:
        adr_ref = fm.get("adr")
        has_adr = bool(adr_ref and (
            (isinstance(adr_ref, list) and adr_ref) or
            (isinstance(adr_ref, str) and adr_ref.strip())
        ))
        if has_adr:
            adr_list = ", ".join(adr_ref) if isinstance(adr_ref, list) else adr_ref
            results.append(check("Schema / ADR", "pass", f"ADR referenced: {adr_list}"))
        else:
            results.append(check("Schema / ADR", "fail",
                                 "Schema changes mentioned but no ADR in frontmatter"))
            critical_fail = True
    else:
        results.append(check("Schema / ADR", "pass", "No schema changes detected"))

    # --- Check 6: Status = APPROVED ---
    body_status = re.search(r"\*\*Status:\*\*\s*(\w+)", body)
    spec_status = fm.get("status") or (body_status and body_status.group(1)) or "UNKNOWN"
    if spec_status == "APPROVED":
        results.append(check("Status", "pass", "APPROVED"))
    elif spec_status == "REVIEW":
        results.append(check("Status", "warn", f"{spec_status} (needs approval)"))
    else:
        results.append(check("Status", "fail", f"{spec_status} (needs approval)"))
        critical_fail = True

    # --- Print results ---
    sym = {"pass": "+", "fail": "x", "warn": "!"}
    overall = "PASS: Ready to implement" if not critical_fail else "FAIL: Not ready to implement"
    print(f"  {overall}\n")

    for r in results:
        print(f"  {sym[r['status']]} {r['label']}: {r['status'].upper()} — {r['detail']}")

    print()
    sys.exit(0 if not critical_fail else 1)


if __name__ == "__main__":
    main()
