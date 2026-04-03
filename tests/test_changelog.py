import unittest
import os
import shutil
import tempfile
import sys
from datetime import datetime

# Add the root directory to sys.path to import from scripts/
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)

from scripts.changelog import get_next_cl_id, extract_metadata, update_main_changelog

class TestChangelogAutomation(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for tests
        self.test_dir = tempfile.mkdtemp()
        self.changelog_dir = os.path.join(self.test_dir, 'changelog')
        self.main_changelog = os.path.join(self.test_dir, 'CHANGELOG.md')
        
        # Mock args for update_main_changelog
        class Args:
            def __init__(self, version, summary):
                self.version = version
                self.summary = summary
        self.mock_args = Args("v2.7.0", "Test summary")

    def tearDown(self):
        # Remove the temporary directory after tests
        shutil.rmtree(self.test_dir)

    def test_get_next_cl_id_empty(self):
        """Verifies current date serial starts at 001."""
        cl_id = get_next_cl_id(self.changelog_dir)
        today = datetime.now().strftime('%Y%m%d')
        self.assertEqual(cl_id, f"CL-{today}-001")

    def test_get_next_cl_id_increment(self):
        """Verifies serial increments correctly based on existing files."""
        os.makedirs(self.changelog_dir)
        today = datetime.now().strftime('%Y%m%d')
        open(os.path.join(self.changelog_dir, f"CL-{today}-001.md"), 'w').close()
        open(os.path.join(self.changelog_dir, f"CL-{today}-002.md"), 'w').close()
        
        cl_id = get_next_cl_id(self.changelog_dir)
        self.assertEqual(cl_id, f"CL-{today}-003")

    def test_extract_metadata(self):
        """Verifies metadata extraction from a Recent entry snippet."""
        snippet = """### [CL-20260404-001] v2.7.0 — Roadmap & Branding Sync
        
**Version:** v2.7.0
**Date:** 2026-04-04
**Severity:** MINOR
**Tags:** #resync #branding
"""
        meta = extract_metadata(snippet)
        self.assertIsNotNone(meta)
        self.assertEqual(meta['id'], "CL-20260404-001")
        self.assertEqual(meta['version'], "v2.7.0")
        self.assertEqual(meta['date'], "2026-04-04")
        self.assertEqual(meta['severity'], "MINOR")

    def test_update_main_changelog_initial(self):
        """Verifies initial CHANGELOG.md creation if missing."""
        entry_content = "Full detail content here."
        update_main_changelog("CL-20260404-001", self.mock_args, entry_content, self.main_changelog)
        
        with open(self.main_changelog, 'r', encoding='utf-8') as f:
            content = f.read()
        
        self.assertIn("## 📝 Recent", content)
        self.assertIn("CL-20260404-001", content)
        self.assertIn("v2.7.0", content)

    def test_update_main_changelog_sliding_window(self):
        """Verifies that the 6th entry moves to the Index table."""
        os.makedirs(self.changelog_dir)
        
        # Create a CHANGELOG.md with 5 existing entries
        # Note: In the real script, they are separated by ### [CL-
        base_content = """# CHANGELOG
**LATEST:** CL-20260404-005 | v1.0.4 | 2026-04-04

---
## 📋 Index (older entries)
| ID | Name | Version | Date | Severity | Tags |
|---|---|---|---|---|---|

---
## 📝 Recent (last 5 — full content)
"""
        for i in range(5, 0, -1):
            base_content += f"""
### [CL-20260404-00{i}] v1.0.{i-1} — Entry {i}
**Version:** v1.0.{i-1}
**Date:** 2026-04-04
**Severity:** MINOR
**Tags:** #test
**Commits:** abc
**Author:** Claude
---
## Summary
Entry {i} summary
"""
        with open(self.main_changelog, 'w', encoding='utf-8') as f:
            f.write(base_content)

        # Add the 6th entry
        latest_id = "CL-20260404-006"
        new_entry = "Summary details for 006."
        self.mock_args.version = "v1.0.5"
        self.mock_args.summary = "Entry 6"
        
        update_main_changelog(latest_id, self.mock_args, new_entry, self.main_changelog)
        
        with open(self.main_changelog, 'r', encoding='utf-8') as f:
            final_content = f.read()

        # 1. 006 should be at the top of Recent
        self.assertIn("### [CL-20260404-006]", final_content)
        
        # 2. 001 should be moved to Index
        self.assertIn("| CL-20260404-001 | Entry 1 | v1.0.0 | 2026-04-04 | MINOR | #test |", final_content)
        
        # 3. 001 full content should be GONE from Recent
        count_001 = final_content.count("### [CL-20260404-001]")
        # 0 in Recent, but the ID still exists in the Index row.
        # However, the pattern we match in split is ### [CL-
        # The Index table row has the ID but not the header format.
        # Entry 1 summary should be missing because its full snippet was in Recent.
        self.assertNotIn("## Summary\nEntry 1 summary", final_content)

if __name__ == '__main__':
    unittest.main()
