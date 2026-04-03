#!/usr/bin/env python3
"""
Zuri: New Feature Spec Creator
Usage: python scripts/new-feature.py "Feature Name"
       python scripts/new-feature.py  (interactive)

Creates:
  docs/product/specs/FEAT-{SLUG}.md   — feature spec (DRAFT)
  docs/product/flows/{slug}-flow.md   — flow skeleton
"""

import sys
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).parent.parent
SPECS_DIR = ROOT / "docs" / "product" / "specs"
FLOWS_DIR = ROOT / "docs" / "product" / "flows"
TEMPLATE = ROOT / ".dev" / "orchestrator" / "templates" / "feature-spec.md"

MODULES = [
    "core/crm",
    "core/inbox",
    "core/pos",
    "core/marketing",
    "core/dsb",
    "core/tasks",
    "shared/auth",
    "shared/ai",
    "shared/multi-tenant",
    "shared/notifications",
    "industry/culinary/enrollment",
    "industry/culinary/kitchen",
]


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def pick_module() -> str:
    print("\n  Select module:")
    for i, m in enumerate(MODULES, 1):
        print(f"    {i:2d}. {m}")
    while True:
        choice = input("\n  Number [1]: ").strip() or "1"
        if choice.isdigit() and 1 <= int(choice) <= len(MODULES):
            return MODULES[int(choice) - 1]
        print("  Invalid choice — enter a number from the list")


def pick_priority() -> str:
    choices = ["P0", "P1", "P2", "P3"]
    print("\n  Priority: " + " / ".join(choices))
    p = input("  [P1]: ").strip().upper() or "P1"
    return p if p in choices else "P1"


def main():
    name = " ".join(sys.argv[1:]).strip() if len(sys.argv) > 1 else ""
    if not name:
        name = input("Feature name: ").strip()
    if not name:
        print("Error: feature name required")
        sys.exit(1)

    slug = slugify(name)
    today = date.today().isoformat()

    description = input("  Short description: ").strip()
    module = pick_module()
    priority = pick_priority()

    SPECS_DIR.mkdir(parents=True, exist_ok=True)
    FLOWS_DIR.mkdir(parents=True, exist_ok=True)

    # --- Feature Spec ---
    if TEMPLATE.exists():
        template = TEMPLATE.read_text(encoding="utf-8")
        template = template.replace("{{NAME}}", slug.upper())
        template = template.replace("{{subtitle}}", description)
        template = template.replace("{{DATE}}", today)
        template = template.replace("{{module}}", module)
        if description:
            template = template.replace(
                "<!-- 2-3 ประโยค อธิบายว่า feature นี้ทำอะไร ทำไมต้องมี -->",
                f"<!-- 2-3 ประโยค อธิบายว่า feature นี้ทำอะไร ทำไมต้องมี -->\n{description}",
            )
    else:
        template = f"""---
title: "FEAT-{slug.upper()}: {name}"
module: {module}
priority: {priority}
status: DRAFT
created: {today}
---

# FEAT-{slug.upper()}: {name}

> {description}

## Overview

<!-- 2-3 ประโยค อธิบายว่า feature นี้ทำอะไร ทำไมต้องมี -->
{description}

## Requirements

### Functional
- ...

### Non-Functional
- ...

## Acceptance Criteria
- [ ] ...

## Out of Scope
- ...
"""

    spec_path = SPECS_DIR / f"FEAT-{slug.upper()}.md"
    spec_path.write_text(template, encoding="utf-8")
    print(f"\n  Created: docs/product/specs/FEAT-{slug.upper()}.md")

    # --- Flow Skeleton ---
    flow_content = f"""---
title: "{name} — Flow"
feature: "{slug}"
created: "{today}"
---

# {name} — Flow

## User Flow

```
[Start] --> [Step 1] --> [Step 2] --> [End]
```

## Sequence Diagram

<!-- Add Mermaid or ASCII sequence diagram here -->

## Edge Cases

- ...
"""
    flow_path = FLOWS_DIR / f"{slug}-flow.md"
    flow_path.write_text(flow_content, encoding="utf-8")
    print(f"  Created: docs/product/flows/{slug}-flow.md")

    print("\n  Feature spec created — review + get Boss approval before implement\n")


if __name__ == "__main__":
    main()
