"""
test_llm.py — Unit tests for co-dev core/llm.py

Run from E:\zuri:
    python -m pytest .dev/co-dev/tests/test_llm.py -v
"""

import pytest
import subprocess
import importlib.util
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch, mock_open

# ── Fixtures / helpers ─────────────────────────────────────────────────

ROUTER_CONFIG = {
    "balanced": {"spec_writing": "gemini-pro", "coding": "claude-sonnet"},
    "speed":    {"spec_writing": "gemini-flash", "coding": "gemini-flash"},
    "cost_mode": "balanced",
    "fallback": {
        "claude-opus":   "claude-sonnet",
        "claude-sonnet": "gemini-flash",
        "gemini-pro":    "claude-sonnet",
        "gemini-flash":  "claude-sonnet",
    },
}

_LLM_PATH = Path(__file__).parent.parent / "core" / "llm.py"


def _import_llm():
    """Load llm.py directly — bypasses core/__init__.py chain (sqlite_vec etc.)."""
    sys.modules.pop("core.llm", None)
    spec = importlib.util.spec_from_file_location("core.llm", _LLM_PATH)
    mod  = importlib.util.module_from_spec(spec)
    sys.modules["core.llm"] = mod
    spec.loader.exec_module(mod)
    return mod


# ── TestCallWithFallback ───────────────────────────────────────────────

class TestCallWithFallback:
    def test_returns_response_and_model_on_success(self):
        """Returns (response, original_model) when first call succeeds."""
        llm = _import_llm()
        with patch.object(llm, "load_router_config", return_value=(
            ROUTER_CONFIG["balanced"], ROUTER_CONFIG["fallback"], "balanced"
        )):
            with patch.object(llm, "call_llm", return_value="good response") as mock_call:
                resp, used_model = llm.call_with_fallback("claude-sonnet", "test prompt")
                assert resp == "good response"
                assert used_model == "claude-sonnet"

    def test_follows_fallback_chain_on_error(self):
        """On [ERROR], follows fallback_chain and returns fallback model."""
        llm = _import_llm()
        fallback_chain = ROUTER_CONFIG["fallback"]
        with patch.object(llm, "load_router_config", return_value=(
            ROUTER_CONFIG["balanced"], fallback_chain, "balanced"
        )):
            call_results = ["[ERROR] something failed", "fallback response"]
            with patch.object(llm, "call_llm", side_effect=call_results):
                resp, used_model = llm.call_with_fallback("claude-sonnet", "test")
                assert resp == "fallback response"
                assert used_model == "gemini-flash"

    def test_follows_fallback_on_quota_exceeded(self):
        """On [QUOTA_EXCEEDED], triggers fallback the same as [ERROR]."""
        llm = _import_llm()
        fallback_chain = ROUTER_CONFIG["fallback"]
        with patch.object(llm, "load_router_config", return_value=(
            ROUTER_CONFIG["balanced"], fallback_chain, "balanced"
        )):
            with patch.object(llm, "call_llm", side_effect=["[QUOTA_EXCEEDED]", "ok"]):
                resp, used_model = llm.call_with_fallback("claude-sonnet", "test")
                assert resp == "ok"

    def test_gemini_to_gemini_loop_redirects_to_claude(self):
        """gemini-pro → gemini-flash loop is broken — redirects to claude-sonnet instead."""
        llm = _import_llm()
        # Simulate router with gemini→gemini fallback (the old bad config)
        loopy_chain = {
            "gemini-pro":   "gemini-flash",   # would loop
            "gemini-flash": "gemini-pro",
        }
        with patch.object(llm, "load_router_config", return_value=(
            {}, loopy_chain, "balanced"
        )):
            call_results = ["[ERROR] quota", "claude saved us"]
            with patch.object(llm, "call_llm", side_effect=call_results) as mock_call:
                resp, used_model = llm.call_with_fallback("gemini-pro", "test")
                # Second call must be claude-sonnet, not gemini-flash
                second_call_model = mock_call.call_args_list[1][0][0]
                assert second_call_model == "claude-sonnet"
                assert used_model == "claude-sonnet"

    def test_returns_error_when_no_fallback(self):
        """Returns original [ERROR] response when no fallback model defined."""
        llm = _import_llm()
        with patch.object(llm, "load_router_config", return_value=({}, {}, "balanced")):
            with patch.object(llm, "call_llm", return_value="[ERROR] no quota left"):
                resp, used_model = llm.call_with_fallback("unknown-model", "test")
                assert resp == "[ERROR] no quota left"
                assert used_model == "unknown-model"



# ── TestCallClaudeCli ──────────────────────────────────────────────────

class TestCallClaudeCli:
    """Tests for _call_claude_cli — the workspace-aware temp file path."""

    def _import(self):
        return _import_llm()

    def test_returns_error_when_binary_missing(self, tmp_path):
        """Returns [ERROR] claude CLI not found when shutil.which returns None."""
        llm = _import_llm()
        with patch("shutil.which", return_value=None):
            result = llm._call_claude_cli("claude-sonnet", "hello", 30)
        assert "[ERROR] claude CLI not found" in result

    def test_temp_file_created_inside_workspace(self, tmp_path, monkeypatch):
        """Temp file is created inside project workspace (not system temp)."""
        llm = _import_llm()
        monkeypatch.setenv("ZURI_PROJECT_ROOT", str(tmp_path))

        created_dirs = []
        mock_result  = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout     = "agent response"

        with patch("shutil.which", return_value="claude"):
            with patch("subprocess.run", return_value=mock_result):
                with patch("tempfile.NamedTemporaryFile") as mock_ntf:
                    # Make NamedTemporaryFile context manager work
                    mock_file      = MagicMock()
                    mock_file.name = str(tmp_path / ".dev/co-dev/tmp/test123.txt")
                    mock_ntf.return_value.__enter__ = lambda s: mock_file
                    mock_ntf.return_value.__exit__  = MagicMock(return_value=False)

                    llm._call_claude_cli("claude-sonnet", "prompt text", 30)

                    # Check dir= was set to workspace tmp_dir
                    call_kwargs = mock_ntf.call_args[1]
                    assert "dir" in call_kwargs
                    assert str(tmp_path) in str(call_kwargs["dir"])

    def test_cleanup_on_timeout(self, tmp_path, monkeypatch):
        """Temp file is cleaned up in finally block even on TimeoutExpired."""
        import os
        llm = _import_llm()
        monkeypatch.setenv("ZURI_PROJECT_ROOT", str(tmp_path))

        # Create a real temp file to verify cleanup
        tmp_dir = tmp_path / ".dev" / "co-dev" / "tmp"
        tmp_dir.mkdir(parents=True)
        real_tmp = tmp_dir / "real_temp.txt"
        real_tmp.write_text("prompt", encoding="utf-8")

        with patch("shutil.which", return_value="claude"):
            with patch("subprocess.run", side_effect=subprocess.TimeoutExpired("claude", 30)):
                with patch("tempfile.NamedTemporaryFile") as mock_ntf:
                    mock_file      = MagicMock()
                    mock_file.name = str(real_tmp)
                    mock_ntf.return_value.__enter__ = lambda s: mock_file
                    mock_ntf.return_value.__exit__  = MagicMock(return_value=False)

                    result = llm._call_claude_cli("claude-sonnet", "prompt", 5)

        assert "[ERROR] claude: timeout" in result
        # File should be cleaned up
        assert not real_tmp.exists()

    def test_returns_quota_exceeded_on_overloaded(self, tmp_path, monkeypatch):
        """Returns [QUOTA_EXCEEDED] when stderr contains 'overloaded'."""
        llm = _import_llm()
        monkeypatch.setenv("ZURI_PROJECT_ROOT", str(tmp_path))

        mock_result            = MagicMock()
        mock_result.returncode = 1
        mock_result.stderr     = "Claude is overloaded. Please try again later."

        with patch("shutil.which", return_value="claude"):
            with patch("subprocess.run", return_value=mock_result):
                with patch("tempfile.NamedTemporaryFile") as mock_ntf:
                    mock_file      = MagicMock()
                    mock_file.name = str(tmp_path / "x.txt")
                    mock_ntf.return_value.__enter__ = lambda s: mock_file
                    mock_ntf.return_value.__exit__  = MagicMock(return_value=False)

                    result = llm._call_claude_cli("claude-sonnet", "test", 30)

        assert result == "[QUOTA_EXCEEDED]"

    def test_returns_quota_exceeded_on_529(self, tmp_path, monkeypatch):
        """Returns [QUOTA_EXCEEDED] when stderr contains '529'."""
        llm = _import_llm()
        monkeypatch.setenv("ZURI_PROJECT_ROOT", str(tmp_path))

        mock_result            = MagicMock()
        mock_result.returncode = 1
        mock_result.stderr     = "HTTP 529 error"

        with patch("shutil.which", return_value="claude"):
            with patch("subprocess.run", return_value=mock_result):
                with patch("tempfile.NamedTemporaryFile") as mock_ntf:
                    mock_file      = MagicMock()
                    mock_file.name = str(tmp_path / "x.txt")
                    mock_ntf.return_value.__enter__ = lambda s: mock_file
                    mock_ntf.return_value.__exit__  = MagicMock(return_value=False)

                    result = llm._call_claude_cli("claude-sonnet", "test", 30)

        assert result == "[QUOTA_EXCEEDED]"

    def test_returns_stdout_on_success(self, tmp_path, monkeypatch):
        """Returns stripped stdout content on returncode 0."""
        llm = _import_llm()
        monkeypatch.setenv("ZURI_PROJECT_ROOT", str(tmp_path))

        mock_result            = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout     = "  feature spec here  \n"

        with patch("shutil.which", return_value="claude"):
            with patch("subprocess.run", return_value=mock_result):
                with patch("tempfile.NamedTemporaryFile") as mock_ntf:
                    mock_file      = MagicMock()
                    mock_file.name = str(tmp_path / "x.txt")
                    mock_ntf.return_value.__enter__ = lambda s: mock_file
                    mock_ntf.return_value.__exit__  = MagicMock(return_value=False)

                    result = llm._call_claude_cli("claude-sonnet", "test", 30)

        assert result == "feature spec here"

    def test_uses_claude_cmd_on_windows(self, tmp_path, monkeypatch):
        """Uses 'claude.cmd' binary name on Windows platform."""
        llm = _import_llm()
        monkeypatch.setenv("ZURI_PROJECT_ROOT", str(tmp_path))

        with patch("platform.system", return_value="Windows"):
            with patch("shutil.which") as mock_which:
                mock_which.return_value = None  # trigger not found
                llm._call_claude_cli("claude-sonnet", "test", 30)
                # First call should be with "claude.cmd"
                first_call_arg = mock_which.call_args_list[0][0][0]
                assert first_call_arg == "claude.cmd"
