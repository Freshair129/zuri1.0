"""
test_tools.py — Unit tests for co-dev core/tools.py

Run from E:\zuri:
    python -m pytest .dev/co-dev/tests/test_tools.py -v
"""

import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch, PropertyMock


# ── Helpers ───────────────────────────────────────────────────────────

def make_tools(tmp_path: Path):
    """Create a ProjectTools instance with mocked Indexer + ContextRetriever."""
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

    # Patch heavy dependencies before import
    with patch.dict("sys.modules", {
        "core.retriever": MagicMock(),
        "core.indexer":   MagicMock(),
    }):
        from core.tools import ProjectTools

    tools = ProjectTools.__new__(ProjectTools)
    tools.project_root = tmp_path
    tools._indexer     = MagicMock()
    tools.retriever    = MagicMock()
    return tools


# ── TestReadFile ───────────────────────────────────────────────────────

class TestReadFile:
    def test_returns_content_for_valid_file(self, tmp_path):
        """read_file returns file content when path exists inside project root."""
        tools = make_tools(tmp_path)
        (tmp_path / "some_file.txt").write_text("hello zuri", encoding="utf-8")
        assert tools.read_file("some_file.txt") == "hello zuri"

    def test_blocks_path_traversal(self, tmp_path):
        """read_file returns Access Denied for ../../etc/passwd traversal attempt."""
        tools = make_tools(tmp_path)
        result = tools.read_file("../../etc/passwd")
        assert result == "[ERROR] Access Denied: Path outside project root."

    def test_returns_error_for_missing_file(self, tmp_path):
        """read_file returns [ERROR] File not found for nonexistent path."""
        tools = make_tools(tmp_path)
        result = tools.read_file("nonexistent.txt")
        assert "[ERROR] File not found" in result

    def test_truncates_large_content(self, tmp_path):
        """read_file truncates at 15000 chars and appends '... (truncated)'."""
        tools = make_tools(tmp_path)
        big = "x" * 16000
        (tmp_path / "big.txt").write_text(big, encoding="utf-8")
        result = tools.read_file("big.txt")
        assert len(result) == len("x" * 15000) + len("\n... (truncated)")
        assert result.endswith("\n... (truncated)")

    def test_returns_full_content_under_limit(self, tmp_path):
        """read_file returns full content when file is under 15000 chars."""
        tools = make_tools(tmp_path)
        content = "y" * 14999
        (tmp_path / "small.txt").write_text(content, encoding="utf-8")
        result = tools.read_file("small.txt")
        assert result == content
        assert "truncated" not in result

    def test_fallback_to_src_subdir(self, tmp_path):
        """read_file tries src/ prefix when original path not found."""
        tools = make_tools(tmp_path)
        src = tmp_path / "src"
        src.mkdir()
        (src / "myfile.js").write_text("export default {}", encoding="utf-8")
        result = tools.read_file("myfile.js")
        assert result == "export default {}"


# ── TestListFiles ──────────────────────────────────────────────────────

class TestListFiles:
    def test_lists_files_in_directory(self, tmp_path):
        """list_files returns newline-separated relative paths."""
        tools = make_tools(tmp_path)
        (tmp_path / "a.txt").write_text("a")
        (tmp_path / "b.txt").write_text("b")
        result = tools.list_files(".")
        assert "a.txt" in result
        assert "b.txt" in result

    def test_blocks_traversal(self, tmp_path):
        """list_files returns Access Denied for ../.. traversal."""
        tools = make_tools(tmp_path)
        result = tools.list_files("../../")
        assert result == "[ERROR] Access Denied."

    def test_missing_directory(self, tmp_path):
        """list_files returns [ERROR] Directory not found for nonexistent dir."""
        tools = make_tools(tmp_path)
        result = tools.list_files("no_such_dir")
        assert "[ERROR] Directory not found" in result


# ── TestGetAdr ─────────────────────────────────────────────────────────

class TestGetAdr:
    def test_missing_adr_dir(self, tmp_path):
        """get_adr returns [ERROR] ADR directory not found when dir absent."""
        tools = make_tools(tmp_path)
        result = tools.get_adr(57)
        assert "[ERROR] ADR directory not found" in result

    def test_returns_adr_content(self, tmp_path):
        """get_adr returns file content when ADR exists."""
        tools = make_tools(tmp_path)
        adr_dir = tmp_path / "docs" / "decisions" / "adrs"
        adr_dir.mkdir(parents=True)
        (adr_dir / "ADR-057-multi-tenant.md").write_text("# ADR-057", encoding="utf-8")
        result = tools.get_adr(57)
        assert "ADR-057" in result

    def test_missing_adr_number(self, tmp_path):
        """get_adr returns [ERROR] ADR N not found when file absent."""
        tools = make_tools(tmp_path)
        adr_dir = tmp_path / "docs" / "decisions" / "adrs"
        adr_dir.mkdir(parents=True)
        result = tools.get_adr(999)
        assert "[ERROR] ADR 999 not found" in result

    def test_pads_number_to_3_digits(self, tmp_path):
        """get_adr searches with zero-padded pattern ADR-057-*.md."""
        tools = make_tools(tmp_path)
        adr_dir = tmp_path / "docs" / "decisions" / "adrs"
        adr_dir.mkdir(parents=True)
        (adr_dir / "ADR-068-rbac.md").write_text("# ADR-068 RBAC", encoding="utf-8")
        result = tools.get_adr(68)
        assert "ADR-068 RBAC" in result


# ── TestSearchEntireSchema ─────────────────────────────────────────────

class TestSearchEntireSchema:
    def _make_hit(self, tag: str, domain: str = "crm") -> dict:
        return {"tag": tag, "file_path": "docs/schema.md",
                "domain": domain, "content": f"model Foo {{ id String }}", "source": "slice"}

    def test_returns_schema_hits(self, tmp_path):
        """search_entire_schema returns SCHEMA-tagged chunks."""
        tools = make_tools(tmp_path)
        tools._indexer.embed.return_value = [0.1] * 1024
        tools.retriever.retrieve.return_value = [self._make_hit("SCHEMA")]
        result = tools.search_entire_schema("customer model")
        assert "model Foo" in result

    def test_returns_schema_stub_hits(self, tmp_path):
        """search_entire_schema also returns SCHEMA_STUB-tagged chunks."""
        tools = make_tools(tmp_path)
        tools._indexer.embed.return_value = [0.1] * 1024
        tools.retriever.retrieve.return_value = [self._make_hit("SCHEMA_STUB")]
        result = tools.search_entire_schema("enrollment FK")
        assert "model Foo" in result

    def test_fallback_when_no_schema_tag(self, tmp_path):
        """search_entire_schema falls back to top-5 hits when no SCHEMA/SCHEMA_STUB found."""
        tools = make_tools(tmp_path)
        tools._indexer.embed.return_value = [0.1] * 1024
        hits = [self._make_hit("DOC") for _ in range(7)]
        tools.retriever.retrieve.return_value = hits
        result = tools.search_entire_schema("anything")
        # Should include content from fallback (first 5)
        assert "model Foo" in result

    def test_empty_result(self, tmp_path):
        """search_entire_schema returns human-readable message when no hits."""
        tools = make_tools(tmp_path)
        tools._indexer.embed.return_value = [0.1] * 1024
        tools.retriever.retrieve.return_value = []
        result = tools.search_entire_schema("impossible query xyz")
        assert result == "No schema chunks found across entire project."

    def test_calls_retrieve_with_no_domain_filter(self, tmp_path):
        """search_entire_schema passes domain_filter=None to retriever."""
        tools = make_tools(tmp_path)
        tools._indexer.embed.return_value = [0.1] * 1024
        tools.retriever.retrieve.return_value = []
        tools.search_entire_schema("test")
        _, kwargs = tools.retriever.retrieve.call_args
        assert kwargs.get("domain_filter") is None or \
               tools.retriever.retrieve.call_args[0][3] is None  # positional


# ── TestToolExecutor ────────────────────────────────────────────────────

class TestToolExecutor:
    def _make_executor(self, tmp_path):
        import sys
        sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))
        with patch.dict("sys.modules", {
            "core.retriever": MagicMock(),
            "core.indexer":   MagicMock(),
        }):
            from core.tools import ToolExecutor
        executor = ToolExecutor.__new__(ToolExecutor)
        executor.tools    = MagicMock()
        executor.mapping  = {}
        return executor

    def test_unknown_tool_returns_error(self, tmp_path):
        """execute returns [ERROR] Unknown tool for unmapped tool name."""
        executor = self._make_executor(tmp_path)
        result = executor.execute("nonexistent_tool", {})
        assert "[ERROR] Tool nonexistent_tool not found" in result

    def test_mapped_tool_is_called(self, tmp_path):
        """execute calls the mapped function and returns its result."""
        executor = self._make_executor(tmp_path)
        mock_fn  = MagicMock(return_value="tool result")
        executor.mapping["my_tool"] = mock_fn
        result = executor.execute("my_tool", {"query": "test"})
        mock_fn.assert_called_once_with(query="test")
        assert result == "tool result"
