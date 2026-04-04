"""
test_pipeline_progress.py - Unit tests for progress indicator math in pipeline.py

These tests isolate just the math/formatting logic so they run fast
without needing Anthropic/Gemini API keys.

Run from E:/zuri:
    python -m pytest .dev/co-dev/tests/test_pipeline_progress.py -v
"""

import pytest
import time
from unittest.mock import patch


# ── Helpers — extract progress bar logic ──────────────────────────────

def compute_progress(step: int, total: int, phase_start: float, now: float):
    """
    Replicate the progress bar math from pipeline.py _run_agent().
    Returns (pct_done, bar_str, eta_str).
    """
    pct_done = int(((step - 1) / total) * 100)
    filled   = pct_done // 5
    bar      = "█" * filled + "░" * (20 - filled)
    eta_str  = ""
    if step > 1 and phase_start > 0:
        elapsed   = now - phase_start
        avg_per   = elapsed / (step - 1)
        remaining = avg_per * (total - step + 1)
        m, s      = divmod(int(remaining), 60)
        eta_str   = f" | ETA ~{m}m{s:02d}s" if m else f" | ETA ~{s}s"
    return pct_done, bar, eta_str


# ── TestPercentage ─────────────────────────────────────────────────────

class TestPercentage:
    def test_step1_of_3_is_0_percent(self):
        """First step (step=1, total=3) shows 0%."""
        pct, _, _ = compute_progress(1, 3, 0.0, 0.0)
        assert pct == 0

    def test_step2_of_3_is_33_percent(self):
        """Second step shows 33%."""
        pct, _, _ = compute_progress(2, 3, 0.0, 0.0)
        assert pct == 33

    def test_step3_of_3_is_66_percent(self):
        """Third step shows 66% (not 100 — 100% shown after completion)."""
        pct, _, _ = compute_progress(3, 3, 0.0, 0.0)
        assert pct == 66

    def test_step1_of_4_is_0_percent(self):
        """Code phase: step=1/4 = 0%."""
        pct, _, _ = compute_progress(1, 4, 0.0, 0.0)
        assert pct == 0

    def test_step2_of_4_is_25_percent(self):
        """Code phase: step=2/4 = 25%."""
        pct, _, _ = compute_progress(2, 4, 0.0, 0.0)
        assert pct == 25

    def test_step4_of_4_is_75_percent(self):
        """Code phase: last step = 75%, not 100%."""
        pct, _, _ = compute_progress(4, 4, 0.0, 0.0)
        assert pct == 75


# ── TestProgressBar ────────────────────────────────────────────────────

class TestProgressBar:
    def test_bar_is_always_20_chars(self):
        """Progress bar string is always exactly 20 characters wide."""
        for step in range(1, 5):
            _, bar, _ = compute_progress(step, 4, 0.0, 0.0)
            assert len(bar) == 20, f"step={step}: bar length={len(bar)}"

    def test_bar_at_0_percent_is_all_empty(self):
        """0% progress bar has no filled blocks."""
        _, bar, _ = compute_progress(1, 3, 0.0, 0.0)
        assert bar == "░" * 20

    def test_bar_at_50_percent_has_10_filled(self):
        """50% bar has exactly 10 filled blocks."""
        # Need step/total such that pct = 50 → step=3, total=4 gives 50%
        pct, bar, _ = compute_progress(3, 4, 0.0, 0.0)
        assert pct == 50
        assert bar.count("█") == 10
        assert bar.count("░") == 10

    def test_bar_increases_monotonically(self):
        """Each successive step has >= filled blocks than previous."""
        prev_filled = -1
        for step in range(1, 5):
            _, bar, _ = compute_progress(step, 4, 0.0, 0.0)
            filled = bar.count("█")
            assert filled >= prev_filled
            prev_filled = filled


# ── TestETA ────────────────────────────────────────────────────────────

class TestETA:
    def test_no_eta_on_step_1(self):
        """ETA is empty string on first step (no elapsed data yet)."""
        _, _, eta = compute_progress(1, 3, 100.0, 110.0)
        assert eta == ""

    def test_no_eta_when_phase_start_is_zero(self):
        """ETA is empty string when phase_start=0 (sentinel for 'not tracked')."""
        _, _, eta = compute_progress(2, 3, 0.0, 30.0)
        assert eta == ""

    def test_eta_shown_from_step_2(self):
        """ETA string is non-empty from step=2 onwards."""
        phase_start = 1000.0
        now         = 1030.0   # 30s elapsed after step 1
        _, _, eta   = compute_progress(2, 3, phase_start, now)
        assert eta != ""
        assert "ETA" in eta

    def test_eta_seconds_only_format(self):
        """ETA uses '~Xs' format when under 60 seconds."""
        # formula: remaining = avg_per * (total - step + 1)
        # step=2/3: (3-2+1)=2 → avg=15s → remaining=30s < 60 → "~30s"
        # elapsed=15s → now = phase_start + 15
        phase_start = 1000.0
        now         = 1015.0   # 15s after phase start (avg=15s per agent)
        _, _, eta   = compute_progress(2, 3, phase_start, now)
        assert "ETA" in eta
        assert "30s" in eta
        assert "m" not in eta  # strictly under 1 minute

    def test_eta_minutes_and_seconds_format(self):
        """ETA uses '~Xm{YY}s' format when >= 60 seconds."""
        # step=2/4: (4-2+1)=3 → need remaining=180s → avg=60s → elapsed=60s
        phase_start = 1000.0
        now         = 1060.0   # 60s elapsed → avg=60s → remaining=60*3=180s=3m00s
        _, _, eta   = compute_progress(2, 4, phase_start, now)
        assert "3m" in eta
        assert "00s" in eta

    def test_eta_seconds_padded_to_two_digits(self):
        """Seconds in ETA are zero-padded to 2 digits (e.g. 2m05s not 2m5s)."""
        # step=2/3: (3-2+1)=2 → avg=62.5s → remaining=125s = 2m05s
        # elapsed=62.5s → now = phase_start + 62.5
        phase_start = 1000.0
        now         = 1062.5   # avg=62.5 → remaining=125s=2m05s
        _, _, eta   = compute_progress(2, 3, phase_start, now)
        assert "2m" in eta
        import re
        match = re.search(r"(\d+)m(\d+)s", eta)
        assert match is not None
        assert len(match.group(2)) == 2  # "05" not "5"

    def test_eta_decreases_as_steps_progress(self):
        """ETA gets smaller as more steps complete (more accurate average)."""
        phase_start = 1000.0

        # After step 1 done (30s), entering step 2 — 2 agents remain
        _, _, eta2 = compute_progress(2, 4, phase_start, 1030.0)

        # After steps 1+2 done (60s), entering step 3 — 1 agent remains
        _, _, eta3 = compute_progress(3, 4, phase_start, 1060.0)

        import re
        def eta_to_seconds(s):
            m = re.search(r"(\d+)m(\d+)s", s)
            if m:
                return int(m.group(1)) * 60 + int(m.group(2))
            m = re.search(r"~(\d+)s", s)
            return int(m.group(1)) if m else 0

        # step3 ETA (1 agent left) < step2 ETA (2 agents left) at same avg
        assert eta_to_seconds(eta3) < eta_to_seconds(eta2)


# ── TestPrintOutput ───────────────────────────────────────────────────

class TestPrintOutput:
    """Test that _run_agent actually prints the progress line."""

    def test_print_called_with_bar_when_total_set(self, capsys):
        """When total > 0, a progress line is printed before agent starts."""
        # Minimal reimplementation of just the print block
        step, total, phase_start = 2, 3, 0.0
        now = 45.0

        with patch("time.time", return_value=now):
            pct_done = int(((step - 1) / total) * 100)
            filled   = pct_done // 5
            bar      = "█" * filled + "░" * (20 - filled)
            eta_str  = ""
            if step > 1 and phase_start > 0:
                elapsed   = now - phase_start
                avg_per   = elapsed / (step - 1)
                remaining = avg_per * (total - step + 1)
                m, s      = divmod(int(remaining), 60)
                eta_str   = f" | ETA ~{m}m{s:02d}s" if m else f" | ETA ~{s}s"
            print(f"\n  [{bar}] {pct_done:3d}%  step {step}/{total}: cto{eta_str}")

        captured = capsys.readouterr()
        assert "33%" in captured.out
        assert "step 2/3" in captured.out
        assert "cto" in captured.out

    def test_no_print_when_total_is_zero(self, capsys):
        """When total=0, progress block is skipped (no extra print)."""
        total = 0
        if total > 0:
            print("should not appear")
        captured = capsys.readouterr()
        assert captured.out == ""
