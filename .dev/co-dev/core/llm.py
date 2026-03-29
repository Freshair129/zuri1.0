"""
llm.py -- Route LLM calls to Gemini CLI or Claude CLI
No API keys needed -- uses CLI auth cached on machine
"""
import subprocess
import os
import json
from pathlib import Path


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
    # model_override takes priority (e.g., CTO always uses Opus)
    if agent_config.get("model_override"):
        return agent_config["model_override"]

    routing, _, _ = load_router_config()
    llm_task = agent_config.get("llm_task", "coding")
    return routing.get(llm_task, "gemini-flash")


def call_llm(model: str, prompt: str, context_files: list[str] = None, timeout: int = 180) -> str:
    """
    Call LLM via CLI subprocess.

    Args:
        model: "claude-opus", "claude-sonnet", "gemini-pro", "gemini-flash"
        prompt: The prompt to send
        context_files: Optional list of file paths to include as context
        timeout: Seconds before timeout

    Returns:
        LLM response text
    """
    # Build context from files
    context = ""
    if context_files:
        for fpath in context_files:
            full_path = Path(os.getenv("ZURI_PROJECT_ROOT", str(Path(__file__).parent.parent.parent.parent))) / fpath
            if full_path.exists():
                try:
                    content = full_path.read_text(encoding="utf-8")
                    # Limit per file to avoid token overflow
                    if len(content) > 10000:
                        content = content[:10000] + "\n... (truncated)"
                    context += f"\n--- {fpath} ---\n{content}\n"
                except Exception:
                    pass

    full_prompt = prompt
    if context:
        full_prompt = f"<context>\n{context}\n</context>\n\n{prompt}"

    if "gemini" in model:
        return _call_gemini(model, full_prompt, timeout)
    elif "claude" in model:
        return _call_claude(model, full_prompt, timeout)
    else:
        return f"[ERROR] Unknown model: {model}"


def _call_gemini(model: str, prompt: str, timeout: int) -> str:
    """Call Gemini via gemini CLI (npm package: @anthropic-ai/gemini or @anthropic/gemini)."""
    import shutil
    import platform

    # Find gemini binary -- on Windows use gemini.cmd
    is_win = platform.system() == "Windows"
    gemini_bin = shutil.which("gemini.cmd" if is_win else "gemini") or shutil.which("gemini")

    if not gemini_bin:
        return "[ERROR] gemini CLI not found -- install: npm install -g @anthropic-ai/gemini-cli"

    # Gemini CLI v0.35+ uses stdin pipe
    # Default model is flash — only override for pro
    cmd = [gemini_bin]
    if model == "gemini-pro":
        cmd += ["--model", "gemini-2.0-pro-exp-03-25"]

    try:
        result = subprocess.run(
            cmd,
            input=prompt,
            capture_output=True,
            text=True,
            timeout=timeout,
            encoding="utf-8",
            shell=is_win,
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


def _call_claude(model: str, prompt: str, timeout: int) -> str:
    """Call Claude via claude CLI (Claude Code)."""
    model_map = {
        "claude-opus": "opus",
        "claude-sonnet": "sonnet",
    }
    claude_model = model_map.get(model, "sonnet")

    cmd = [
        "claude",
        "-p", prompt,
        "--model", claude_model,
        "--output-format", "text",
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            encoding="utf-8",
        )
        if result.returncode != 0:
            return f"[ERROR] claude: {result.stderr.strip()}"
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        return "[ERROR] claude: timeout"
    except FileNotFoundError:
        return "[ERROR] claude CLI not found"


def call_with_fallback(model: str, prompt: str, context_files: list[str] = None) -> tuple[str, str]:
    """
    Call LLM with automatic fallback on error/quota.

    Returns:
        (response, actual_model_used)
    """
    _, fallback_chain, _ = load_router_config()

    response = call_llm(model, prompt, context_files)

    if response.startswith("[QUOTA_EXCEEDED]") or response.startswith("[ERROR]"):
        fallback_model = fallback_chain.get(model)
        if fallback_model:
            response = call_llm(fallback_model, prompt, context_files)
            return response, fallback_model

    return response, model
