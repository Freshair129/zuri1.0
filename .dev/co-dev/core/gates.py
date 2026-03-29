"""
gates.py -- Human approval gates (Boss must approve before proceeding)
"""
import json
from pathlib import Path
from datetime import datetime


class GateManager:
    """Manage human approval gates via gates.json."""

    def __init__(self, base_dir: str = None):
        self.base_dir = Path(base_dir or Path(__file__).parent.parent)
        self.gates_file = self.base_dir / "gates.json"
        self._ensure_file()

    def _ensure_file(self):
        if not self.gates_file.exists():
            self.gates_file.write_text(
                json.dumps({"approvals": []}, indent=2),
                encoding="utf-8",
            )

    def _load(self) -> dict:
        return json.loads(self.gates_file.read_text(encoding="utf-8"))

    def _save(self, data: dict):
        self.gates_file.write_text(
            json.dumps(data, indent=2, ensure_ascii=False, default=str),
            encoding="utf-8",
        )

    def requires_approval(self, action: str, gates_config: list[dict]) -> bool:
        """Check if action requires human approval based on gates.yaml."""
        for gate in gates_config:
            if gate.get("action") == action:
                return gate.get("requires_human", False)
        return False

    def request_approval(self, agent: str, action: str, reason: str, detail: str = "") -> str:
        """Create a pending approval request. Returns gate_id."""
        data = self._load()
        gate_id = f"gate_{len(data['approvals']) + 1:03d}"

        data["approvals"].append({
            "id": gate_id,
            "agent": agent,
            "action": action,
            "reason": reason,
            "detail": detail[:500],
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "resolved_at": None,
            "note": None,
        })

        self._save(data)
        return gate_id

    def resolve(self, gate_id: str, approved: bool, note: str = ""):
        """Approve or reject a gate."""
        data = self._load()
        for gate in data["approvals"]:
            if gate["id"] == gate_id:
                gate["status"] = "approved" if approved else "rejected"
                gate["resolved_at"] = datetime.now().isoformat()
                gate["note"] = note
                break
        self._save(data)

    def get_pending(self) -> list[dict]:
        """Get all pending approval requests."""
        data = self._load()
        return [g for g in data["approvals"] if g["status"] == "pending"]

    def is_approved(self, gate_id: str) -> bool:
        """Check if a specific gate is approved."""
        data = self._load()
        for gate in data["approvals"]:
            if gate["id"] == gate_id:
                return gate["status"] == "approved"
        return False
