import os
import sys
import argparse
from datetime import datetime
import re

# --- Configuration (from CHANGELOG_SYSTEM.md) ---
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHANGELOG_DIR = os.path.join(ROOT_DIR, 'changelog')
MAIN_CHANGELOG = os.path.join(ROOT_DIR, 'CHANGELOG.md')
MAX_RECENT_ENTRIES = 5
AUTHOR = "Claude"

# --- Templates ---
ENTRY_TEMPLATE = """# [{cl_id}] — {summary}

**Version:** {version}
**Date:** {date}
**Severity:** {severity}
**Tags:** {tags}
**Commits:** (pending)
**Author:** {author}

---

## Summary
{summary}

## Changes
{changes}

{root_cause_section}
## Files Modified
{files}

## Verification
1. Verify CI/CD pipeline
2. Ensure no regression in existing tests
"""

CHANGELOG_SKELETON = """# CHANGELOG

**LATEST:** {cl_id} | {version} | {date}

---

## 📋 Index (older entries)

| ID | Name | Version | Date | Severity | Tags |
|---|---|---|---|---|---|
{index_rows}

---

## 📝 Recent (last 5 — full content)

{recent_entries}
"""

def get_next_cl_id(changelog_dir=CHANGELOG_DIR):
    today = datetime.now().strftime('%Y%m%d')
    if not os.path.exists(changelog_dir):
        os.makedirs(changelog_dir)
    
    pattern = re.compile(rf'CL-{today}-(\d{{3}}).md')
    serials = []
    
    for filename in os.listdir(changelog_dir):
        match = pattern.match(filename)
        if match:
            serials.append(int(match.group(1)))
    
    next_serial = max(serials, default=0) + 1
    return f"CL-{today}-{next_serial:03d}"

def extract_metadata(entry_content):
    """Simple parser to extract ID, Summary, Version, Date, Severity, Tags from a full entry snippet."""
    # Find the header: ### [CL-ID] v[VERSION] — [SUMMARY]
    header_match = re.search(r'### \[(CL-\d{8}-\d{3})\] (v\S+) — (.*)', entry_content)
    if not header_match:
        return None
    
    cl_id = header_match.group(1)
    version = header_match.group(2)
    summary = header_match.group(3)
    
    # Metadata block:
    # **Date:** YYYY-MM-DD
    # **Severity:** ...
    # **Tags:** ...
    date_match = re.search(r'\*\*Date:\*\* (.*)', entry_content)
    severity_match = re.search(r'\*\*Severity:\*\* (.*)', entry_content)
    tags_match = re.search(r'\*\*Tags:\*\* (.*)', entry_content)
    
    return {
        'id': cl_id,
        'version': version,
        'summary': summary,
        'date': date_match.group(1) if date_match else "N/A",
        'severity': severity_match.group(1) if severity_match else "N/A",
        'tags': tags_match.group(1) if tags_match else "N/A"
    }

def update_main_changelog(cl_id, args, entry_content, main_changelog=MAIN_CHANGELOG):
    if not os.path.exists(main_changelog):
        with open(main_changelog, 'w', encoding='utf-8') as f:
            f.write(CHANGELOG_SKELETON.format(
                cl_id=cl_id,
                version=args.version,
                date=datetime.now().strftime('%Y-%m-%d'),
                index_rows="",
                recent_entries=""
            ))
    
    with open(main_changelog, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into sections
    # We look for the headers specifically to split the file
    index_marker = "## 📋 Index (older entries)"
    recent_marker = "## 📝 Recent (last 5 — full content)"
    
    if index_marker in content and recent_marker in content:
        # Extract Index rows
        index_part = content.split(index_marker)[1].split("---")[0].strip()
        index_lines = index_part.split("\n")
        if len(index_lines) >= 2 and "| ID |" in index_lines[0]:
            index_rows = "\n".join(index_lines[2:]).strip()
        else:
            index_rows = index_part
            
        # Extract Recent entries
        recent_part = content.split(recent_marker)[1].strip()
        # Split by the entry header pattern
        recent_entries = re.split(r'(?m)^### \[CL-', recent_part)
        recent_entries = [f"### [CL-{e.strip()}" for e in recent_entries if e.strip()]
    else:
        index_rows = ""
        recent_entries = []

    # Prepend new entry
    new_recent_snippet = f"### [{cl_id}] {args.version} — {args.summary}\n\n" + entry_content.strip()
    recent_entries.insert(0, new_recent_snippet)
    
    # Check sliding window
    if len(recent_entries) > MAX_RECENT_ENTRIES:
        # Move oldest to index
        oldest = recent_entries.pop()
        meta = extract_metadata(oldest)
        if meta:
            new_row = f"| {meta['id']} | {meta['summary']} | {meta['version']} | {meta['date']} | {meta['severity']} | {meta['tags']} |"
            index_rows = (new_row + "\n" + index_rows).strip()

    # Reconstruct with absolute clean structure
    recent_joined = "\n\n".join(recent_entries)
    new_content = f"""# CHANGELOG

**LATEST:** {cl_id} | {args.version} | {datetime.now().strftime('%Y-%m-%d')}

---

## 📋 Index (older entries)

| ID | Name | Version | Date | Severity | Tags |
|---|---|---|---|---|---|
{index_rows}

---

## 📝 Recent (last 5 — full content)

{recent_joined}
"""
    
    with open(main_changelog, 'w', encoding='utf-8') as f:
        f.write(new_content.strip() + "\n")

def main():
    parser = argparse.ArgumentParser(description="Zuri Platform Changelog Automation")
    parser.add_argument("--version", required=True, help="Release version (e.g., v2.3.0)")
    parser.add_argument("--severity", required=True, choices=["PATCH", "MINOR", "MAJOR", "HOTFIX"], help="Severity level")
    parser.add_argument("--summary", required=True, help="One-line summary")
    parser.add_argument("--changes", required=True, help="Detailed changes (multiline allowed)")
    parser.add_argument("--files", required=True, help="Space-separated list of modified files")
    parser.add_argument("--tags", required=True, help="Impact tags (e.g., #schema #api)")
    parser.add_argument("--root-cause", help="Optional root cause for fixes")

    args = parser.parse_args()
    
    cl_id = get_next_cl_id()
    today_str = datetime.now().strftime('%Y-%m-%d')
    
    # Prepare individual file content
    root_cause_section = f"## Root Cause\n{args.root_cause}\n\n" if args.root_cause else ""
    # Format files list
    formatted_files = "\n".join([f"- {f.strip()}" for f in args.files.split(',')])
    
    entry_full_text = ENTRY_TEMPLATE.format(
        cl_id=cl_id,
        summary=args.summary,
        version=args.version,
        date=today_str,
        severity=args.severity,
        tags=args.tags,
        author=AUTHOR,
        changes=args.changes,
        root_cause_section=root_cause_section,
        files=formatted_files
    )
    
    # Save individual entry
    filename = os.path.join(CHANGELOG_DIR, f"{cl_id}.md")
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(entry_full_text)
    
    # Update CHANGELOG.md (the sliding window file)
    update_main_changelog(cl_id, args, entry_full_text)
    
    print(f"Created changelog entry: {cl_id}")
    print(f"File updated: {MAIN_CHANGELOG}")
    print(f"Individual file created: {filename}")

if __name__ == "__main__":
    main()
