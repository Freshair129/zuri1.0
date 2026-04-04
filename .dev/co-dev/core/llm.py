"""
llm.py -- Route LLM calls to Gemini CLI / Claude CLI / SDK (Phase C)

Priority:
  1. SDK (if API key present)  → Gemini SDK, Anthropic SDK
  2. CLI subprocess fallback   → gemini CLI, claude CLI

Phase C: call_with_tools() — Anthropic/Gemini SDK with function calling
"""
import os
# Suppress gRPC/ALTS verbose warnings BEFORE any google library imports
os.environ.setdefault("GRPC_VERBOSITY", "ERROR")
os.environ.setdefault("GRPC_TRACE", "")

import subprocess
import json
from pathlib import Path

def load_model_map() -> dict:
    """Read models: block from router.yaml → {alias: actual_api_model_string}.

    e.g. {"gemini-flash": "gemini-2.0-flash-exp", "claude-opus": "claude-opus-4-6", ...}

    router.yaml is the SSOT for model names — change model IDs there, not here.
    Falls back to safe defaults if config is missing or unreadable.
    """
    import yaml
    defaults = {
        "gemini-flash":  "gemini-2.0-flash-exp",
        "gemini-pro":    "gemini-2.0-flash-exp",   # pro → flash-exp until pro available
        "claude-opus":   "claude-opus-4-6",
        "claude-sonnet": "claude-sonnet-4-6",
    }
    try:
        config_path = Path(__file__).parent.parent / "config" / "router.yaml"
        with open(config_path, "r", encoding="utf-8") as f:
            config = yaml.safe_load(f)
        models = config.get("models", {})
        if not models:
            return defaults
        return {
            alias: info.get("model", defaults.get(alias, alias))
            for alias, info in models.items()
        }
    except Exception:
        return defaults

def _suppress_grpc_stderr(fn):
    """Decorator: redirect stderr during fn() to suppress gRPC/ALTS noise."""
    import functools
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        import sys, io
        old_stderr = sys.stderr
        sys.stderr  = io.StringIO()
        try:
            return fn(*args, **kwargs)
        finally:
            sys.stderr = old_stderr
    return wrapper


# ── Config ────────────────────────────────────────────────────────

def load_router_config():
    """Load router.yaml and return active routing table."""
    import yaml
    config_path = Path(__file__).parent.parent / "config" / "router.yaml"
    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    cost_mode = os.getenv("CODEV_COST_MODE", config.get("cost_mode", "balanced"))
    routing = config.get(cost_mode, config.get("balanced", {}))
    fallback = config.get("fallback", {})
    return routing, fallback, cost_mode


def resolve_model(agent_config: dict) -> str:
    """Determine which model to use for an agent."""
    if agent_config.get("model_override"):
        return agent_config["model_override"]
    routing, _, _ = load_router_config()
    llm_task = agent_config.get("llm_task", "coding")
    return routing.get(llm_task, "gemini-flash")


# ── Main call entry point ──────────────────────────────────────────

def call_llm(model: str, prompt: str, context_files: list = None, timeout: int = 180) -> str:
    """
    Call LLM. Prefers SDK if API key present, falls back to CLI subprocess.

    Args:
        model:         "claude-opus" | "claude-sonnet" | "gemini-pro" | "gemini-flash"
        prompt:        The prompt to send
        context_files: File paths to inject as <files> block
        timeout:       Seconds before timeout
    """
    # Build <files> block from context_files
    context = ""
    if context_files:
        project_root = Path(os.getenv("ZURI_PROJECT_ROOT",
                            str(Path(__file__).parent.parent.parent.parent)))
        for fpath in context_files:
            full_path = project_root / fpath
            if full_path.exists():
                try:
                    content = full_path.read_text(encoding="utf-8")
                    if len(content) > 10000:
                        content = content[:10000] + "\n... (truncated)"
                    context += f"\n--- {fpath} ---\n{content}\n"
                except Exception:
                    pass

    full_prompt = prompt
    if context:
        full_prompt = f"<files>\n{context}\n</files>\n\n{prompt}"

    # Route by model
    google_key    = os.getenv("GOOGLE_AI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")

    if "gemini" in model:
        if google_key:
            return _call_gemini_sdk(model, full_prompt, google_key, timeout)
        return _call_gemini_cli(model, full_prompt, timeout)

    elif "claude" in model:
        if anthropic_key:
            return _call_anthropic_sdk(model, full_prompt, anthropic_key, timeout)
        return _call_claude_cli(model, full_prompt, timeout)

    else:
        return f"[ERROR] Unknown model: {model}"


def call_with_fallback(model: str, prompt: str, context_files: list = None) -> tuple:
    """
    Call LLM with automatic fallback on quota/error.
    Gemini CLI calls use a short timeout (60s) to fail fast and fall back to Claude.

    Returns:
        (response_text, actual_model_used)
    """
    _, fallback_chain, _ = load_router_config()

    # Gemini CLI is slow over OAuth — fail fast and fall through to Claude
    gemini_timeout = 60
    default_timeout = 180

    is_gemini = "gemini" in model
    timeout = gemini_timeout if is_gemini else default_timeout

    response = call_llm(model, prompt, context_files, timeout=timeout)

    if response.startswith("[QUOTA_EXCEEDED]") or response.startswith("[ERROR]"):
        # Follow fallback chain — but never loop back into a gemini model if
        # we just came from one (avoids gemini-pro ↔ gemini-flash infinite loop)
        fallback_model = fallback_chain.get(model)
        if fallback_model and ("gemini" in fallback_model) and is_gemini:
            # Skip gemini-to-gemini hop → go straight to claude-sonnet
            fallback_model = "claude-sonnet"
        if fallback_model:
            print(f"\n    (falling back to {fallback_model})", flush=True)
            response = call_llm(fallback_model, prompt, context_files)
            return response, fallback_model

    return response, model


# ── Phase C: Tool Calling ──────────────────────────────────────────

def call_with_tools(model: str, prompt: str, tools: list,
                    tool_executor=None, max_rounds: int = 5) -> str:
    """
    Call LLM with function/tool calling support.
    Agent pulls context on demand instead of receiving it upfront.

    Args:
        model:         "claude-opus" | "claude-sonnet" | "gemini-flash" | "gemini-pro"
        prompt:        Initial user prompt
        tools:         List of tool definitions (Anthropic or Gemini format)
        tool_executor: Callable(tool_name, tool_args) → str result
        max_rounds:    Max tool call rounds before forcing final answer

    Returns:
        Final text response after all tool calls resolved
    """
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    google_key    = os.getenv("GOOGLE_AI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    if "claude" in model and anthropic_key:
        return _tool_call_anthropic(model, prompt, tools, tool_executor, max_rounds, anthropic_key)
    elif "gemini" in model and google_key:
        return _tool_call_gemini(model, prompt, tools, tool_executor, max_rounds, google_key)
    else:
        # No SDK available — fall back to prompt-based (no real tool calling)
        return call_llm(model, prompt)


def _tool_call_anthropic(model: str, prompt: str, tools: list,
                         tool_executor, max_rounds: int, api_key: str) -> str:
    """Anthropic SDK tool calling loop."""
    try:
        import anthropic as ant
    except ImportError:
        return "[ERROR] pip install anthropic"

    _mm = load_model_map()
    actual_model = _mm.get(model, _mm.get("claude-sonnet", "claude-sonnet-4-6"))

    client   = ant.Anthropic(api_key=api_key)
    messages = [{"role": "user", "content": prompt}]

    for _ in range(max_rounds):
        try:
            resp = client.messages.create(
                model=actual_model,
                max_tokens=4096,
                tools=tools,
                messages=messages,
            )
        except Exception as e:
            return f"[ERROR] anthropic tool call: {e}"

        # Collect text + tool uses
        text_parts  = []
        tool_uses   = []
        tool_results = []

        for block in resp.content:
            if block.type == "text":
                text_parts.append(block.text)
            elif block.type == "tool_use":
                tool_uses.append(block)

        if not tool_uses or resp.stop_reason == "end_turn":
            return "\n".join(text_parts)

        # Execute tools
        messages.append({"role": "assistant", "content": resp.content})
        for tu in tool_uses:
            result = "[ERROR] no executor"
            if tool_executor:
                try:
                    result = str(tool_executor(tu.name, tu.input))
                except Exception as e:
                    result = f"[TOOL ERROR] {e}"
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tu.id,
                "content": result,
            })
        messages.append({"role": "user", "content": tool_results})

    return "[ERROR] max tool rounds reached"


@_suppress_grpc_stderr
def _tool_call_gemini(model_name: str, prompt: str, tools: list,
                      tool_executor, max_rounds: int, api_key: str) -> str:
    """Gemini SDK function calling loop.

    Converts Anthropic-format tool definitions → Gemini function_declarations format:
      Anthropic: [{"name": ..., "description": ..., "parameters": {...}}]
      Gemini:    [{"function_declarations": [{"name": ..., ...}]}]
    """
    try:
        import google.generativeai as genai
    except ImportError:
        return "[ERROR] pip install google-generativeai"

    genai.configure(api_key=api_key)
    _mm = load_model_map()
    actual_model = _mm.get("gemini-flash") if "flash" in model_name else _mm.get("gemini-pro", _mm.get("gemini-flash"))

    # Convert Anthropic-format → Gemini function_declarations format
    gemini_tools = [{"function_declarations": [
        {
            "name":        t["name"],
            "description": t.get("description", ""),
            "parameters":  t.get("parameters", {}),
        }
        for t in tools
    ]}]

    try:
        model = genai.GenerativeModel(actual_model, tools=gemini_tools)
        chat  = model.start_chat()
        resp  = chat.send_message(prompt)

        for _ in range(max_rounds):
            fn_calls = [
                p.function_call for p in resp.parts
                if hasattr(p, "function_call") and p.function_call
            ]
            if not fn_calls:
                return resp.text

            fn_responses = []
            for fc in fn_calls:
                result = "[ERROR] no executor"
                if tool_executor:
                    try:
                        result = str(tool_executor(fc.name, dict(fc.args)))
                    except Exception as e:
                        result = f"[TOOL ERROR] {e}"
                fn_responses.append(
                    genai.protos.Part(function_response=genai.protos.FunctionResponse(
                        name=fc.name, response={"result": result}
                    ))
                )
            resp = chat.send_message(fn_responses)

        return resp.text
    except Exception as e:
        return f"[ERROR] gemini tool call: {e}"


# ── SDK callers (no tool calling) ─────────────────────────────────

@_suppress_grpc_stderr
def _call_gemini_sdk(model_name: str, prompt: str, api_key: str, timeout: int) -> str:
    """Call Gemini via google-generativeai SDK (no tools)."""
    try:
        import google.generativeai as genai
    except ImportError:
        return _call_gemini_cli(model_name, prompt, timeout)

    genai.configure(api_key=api_key)
    _mm = load_model_map()
    actual = _mm.get("gemini-flash") if "flash" in model_name else _mm.get("gemini-pro", _mm.get("gemini-flash"))
    try:
        model    = genai.GenerativeModel(actual)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        if "429" in str(e) or "quota" in str(e).lower():
            return "[QUOTA_EXCEEDED]"
        return f"[ERROR] gemini SDK: {e}"


def _call_anthropic_sdk(model_name: str, prompt: str, api_key: str, timeout: int) -> str:
    """Call Claude via Anthropic SDK (no tools)."""
    try:
        import anthropic as ant
    except ImportError:
        return _call_claude_cli(model_name, prompt, timeout)

    _mm = load_model_map()
    actual_model = _mm.get(model_name, _mm.get("claude-sonnet", "claude-sonnet-4-6"))
    try:
        client = ant.Anthropic(api_key=api_key)
        resp   = client.messages.create(
            model=actual_model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        return resp.content[0].text
    except Exception as e:
        if "529" in str(e) or "overloaded" in str(e).lower():
            return "[QUOTA_EXCEEDED]"
        return f"[ERROR] anthropic SDK: {e}"


# ── CLI subprocess fallbacks ───────────────────────────────────────

def _call_gemini_cli(model: str, prompt: str, timeout: int) -> str:
    """Call Gemini via gemini CLI (npm package: @google/gemini-cli).
    Uses temp file for stdin to avoid Windows pipe-buffer deadlock.
    """
    import shutil, platform, tempfile, os

    is_win     = platform.system() == "Windows"
    gemini_bin = shutil.which("gemini.cmd" if is_win else "gemini") or shutil.which("gemini")

    if not gemini_bin:
        return "[ERROR] gemini CLI not found -- install: npm install -g @google/gemini-cli"

    # Write prompt to temp file → avoids Windows pipe-buffer deadlock with large prompts
    tmp = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".txt", delete=False, encoding="utf-8"
        ) as f:
            f.write(prompt)
            tmp = f.name

        cmd = [gemini_bin]
        _mm = load_model_map()
        actual = _mm.get(model)
        if actual:
            cmd += ["--model", actual]

        with open(tmp, "r", encoding="utf-8") as stdin_f:
            result = subprocess.run(
                cmd,
                stdin=stdin_f,
                capture_output=True,
                text=True,
                timeout=timeout,
                encoding="utf-8",
            )

        if result.returncode != 0:
            stderr = result.stderr.strip()
            if "429" in stderr or "quota" in stderr.lower():
                return "[QUOTA_EXCEEDED]"
            return f"[ERROR] gemini: {stderr}"
        return result.stdout.strip()

    except subprocess.TimeoutExpired:
        return "[ERROR] gemini: timeout"
    except FileNotFoundError:
        return "[ERROR] gemini CLI not found"
    finally:
        if tmp and os.path.exists(tmp):
            os.unlink(tmp)


def _call_claude_cli(model: str, prompt: str, timeout: int) -> str:
    """Call Claude via claude CLI (Claude Code).
    Uses shutil.which + .cmd extension on Windows (same pattern as _call_gemini_cli).
    Uses temp file for stdin to avoid Windows pipe-buffer deadlock with large prompts.
    """
    import shutil, platform, tempfile, os

    is_win     = platform.system() == "Windows"
    claude_bin = shutil.which("claude.cmd" if is_win else "claude") or shutil.which("claude")

    if not claude_bin:
        return "[ERROR] claude CLI not found -- install: npm install -g @anthropic-ai/claude-code"

    model_map    = {"claude-opus": "opus", "claude-sonnet": "sonnet"}
    claude_model = model_map.get(model, "sonnet")

    # Temp file MUST be inside project workspace so Claude Code CLI
    # doesn't deny access (security: CLI blocks reads outside workspace dir)
    project_root = Path(os.getenv("ZURI_PROJECT_ROOT",
                        str(Path(__file__).parent.parent.parent.parent)))
    tmp_dir = project_root / ".dev" / "co-dev" / "tmp"
    tmp_dir.mkdir(parents=True, exist_ok=True)

    tmp = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".txt", delete=False, encoding="utf-8",
            dir=tmp_dir,             # ← inside workspace, not system temp
        ) as f:
            f.write(prompt)
            tmp = f.name

        cmd = [
            claude_bin,
            "-p", f"@{tmp}",          # read prompt from file (avoids arg-length limit)
            "--model", claude_model,
            "--output-format", "text",
        ]

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            encoding="utf-8",
        )

        if result.returncode != 0:
            stderr = result.stderr.strip()
            if "overloaded" in stderr.lower() or "529" in stderr:
                return "[QUOTA_EXCEEDED]"
            return f"[ERROR] claude: {stderr}"
        return result.stdout.strip()

    except subprocess.TimeoutExpired:
        return "[ERROR] claude: timeout"
    except FileNotFoundError:
        return "[ERROR] claude CLI not found"
    finally:
        if tmp and os.path.exists(tmp):
            os.unlink(tmp)
