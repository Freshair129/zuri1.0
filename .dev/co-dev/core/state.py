"""
state.py -- Persistent state management (JSON files, git-trackable)
"""
import json
from pathlib import Path
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"
    BLOCKED = "blocked"


class ProjectState(BaseModel):
    task_id: str
    task_description: str
    phase: str = "doc"
    status: TaskStatus = TaskStatus.PENDING
    current_agent: Optional[str] = None
    completed_steps: list[str] = []
    files_modified: list[str] = []
    results: dict = {}
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class HistoryEntry(BaseModel):
    ts: str
    agent: str
    action: str
    model: str = ""
    detail: str = ""
    duration_ms: int = 0


class StateManager:
    """Read/write project state + append-only history log."""

    def __init__(self, base_dir: str = None):
        self.base_dir = Path(base_dir or Path(__file__).parent.parent)
        self.state_file = self.base_dir / "project_state.json"
        self.history_file = self.base_dir / "history_log.jsonl"

    def load_state(self) -> Optional[ProjectState]:
        if self.state_file.exists():
            data = json.loads(self.state_file.read_text(encoding="utf-8"))
            return ProjectState(**data)
        return None

    def save_state(self, state: ProjectState):
        state.updated_at = datetime.now()
        self.state_file.write_text(
            state.model_dump_json(indent=2),
            encoding="utf-8",
        )

    def create_task(self, task_id: str, description: str, phase: str = "doc") -> ProjectState:
        state = ProjectState(
            task_id=task_id,
            task_description=description,
            phase=phase,
            status=TaskStatus.IN_PROGRESS,
        )
        self.save_state(state)
        return state

    def mark_step(self, state: ProjectState, agent: str, step: str):
        timestamp = datetime.now().strftime("%H:%M")
        state.completed_steps.append(f"[{timestamp}] {agent}: {step}")
        state.current_agent = agent
        self.save_state(state)

    def mark_done(self, state: ProjectState):
        state.status = TaskStatus.DONE
        state.current_agent = None
        self.save_state(state)

    def log_history(self, agent: str, action: str, model: str = "", detail: str = "", duration_ms: int = 0):
        entry = HistoryEntry(
            ts=datetime.now().isoformat(),
            agent=agent,
            action=action,
            model=model,
            detail=detail[:500],
            duration_ms=duration_ms,
        )
        with open(self.history_file, "a", encoding="utf-8") as f:
            f.write(entry.model_dump_json() + "\n")

    def get_recent_history(self, n: int = 20) -> list[HistoryEntry]:
        if not self.history_file.exists():
            return []
        lines = self.history_file.read_text(encoding="utf-8").strip().split("\n")
        recent = lines[-n:] if len(lines) > n else lines
        return [HistoryEntry(**json.loads(line)) for line in recent if line.strip()]
