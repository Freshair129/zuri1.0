#!/usr/bin/env python3
"""
Zuri: New ADR Creator
Usage: python scripts/new-adr.py "ADR Title"
       python scripts/new-adr.py  (interactive)
"""

import sys
import os
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).parent.parent
ADR_DIR = ROOT / "docs" / "decisions" / "adrs"
TEMPLATE = ROOT / ".dev" / "templates" / "adr.md"


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def next_adr_number() -> int:
    ADR_DIR.mkdir(parents=True, exist_ok=True)
    max_num = 68  # start from 069 if none found (ADR-068 is current highest)
    for f in ADR_DIR.iterdir():
        m = re.match(r"ADR-(\d+)", f.name)
        if m:
            max_num = max(max_num, int(m.group(1)))
    return max_num + 1


def main():
    title = " ".join(sys.argv[1:]).strip() if len(sys.argv) > 1 else ""
    if not title:
        title = input("ADR title: ").strip()
    if not title:
        print("Error: title required")
        sys.exit(1)

    num = next_adr_number()
    padded = str(num).zfill(3)
    slug = slugify(title)
    today = date.today().isoformat()

    print(f"\n  Next ADR: ADR-{padded}")
    print("  Fill in content (press Enter to leave blank):\n")

    context = input("  Context — what is the problem? Why decide? ").strip()
    decision = input("  Decision — what was chosen and why? ").strip()
    consequences = input("  Consequences — positive/negative impacts? ").strip()

    # Read template
    if TEMPLATE.exists():
        template = TEMPLATE.read_text(encoding="utf-8")
        template = template.replace("{{NUMBER}}", padded)
        template = template.replace("{{TITLE}}", title)
        template = template.replace("{{DATE}}", today)
        if context:
            template = template.replace(
                "<!-- ปัญหาคืออะไร? ทำไมต้องตัดสินใจ? -->",
                f"<!-- ปัญหาคืออะไร? ทำไมต้องตัดสินใจ? -->\n\n{context}",
            )
        if decision:
            template = template.replace(
                "<!-- เลือกอะไร? ทำไม? -->",
                f"<!-- เลือกอะไร? ทำไม? -->\n\n{decision}",
            )
        if consequences:
            template = template.replace(
                "### Positive\n- ...",
                f"### Positive\n- {consequences}",
            )
    else:
        # Fallback minimal template
        template = f"""---
title: "ADR-{padded}: {title}"
date: {today}
status: DRAFT
---

# ADR-{padded}: {title}

## Context

{context or "..."}

## Decision

{decision or "..."}

## Consequences

### Positive
- {consequences or "..."}

### Negative
- ...
"""

    filename = f"ADR-{padded}-{slug}.md"
    filepath = ADR_DIR / filename
    filepath.write_text(template, encoding="utf-8")

    print(f"\n  Created: docs/decisions/adrs/{filename}")
    print(f"  ADR-{padded} created — needs Boss approval\n")


if __name__ == "__main__":
    main()
