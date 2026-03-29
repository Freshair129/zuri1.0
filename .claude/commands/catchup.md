Load full project context before starting work. Read these files in order:

1. Read `.dev/shared-context/GOAL.md` — current phase and pending tasks
2. Read `.dev/shared-context/MEMORY.md` — what previous session completed
3. Read `.dev/shared-context/CONTEXT_INDEX.yaml` — which domain context to load

Then summarize to Boss:
- Current phase
- Pending tasks (count + list)
- What last session did
- Suggested next action

Rules:
- Never skip a file — if missing, report it
- If MEMORY.md has a blocking issue → report first
- If GOAL.md has an in_progress task → ask Boss whether to continue
