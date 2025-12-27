---
description: Mark a task as blocked with a reason
---

# Conductor Block

Mark a task as blocked.

## 1. Identify Task
- If argument provided, find that task
- Otherwise show in-progress tasks for selection

## 2. Get Reason
Ask for the blocking reason.

## 3. Update Plan
Change `[~]` to `[!]` and append `[BLOCKED: reason]`

## 4. Sync with Beads (if enabled)
- Check if `conductor/beads.json` exists and `enabled: true`
- If enabled and task has `beads_task_id` in track metadata:
  - Run:
    ```bash
    bd update <task_id> --status blocked
    bd update <task_id> --notes "BLOCKED: <reason>
    CATEGORY: <External/Technical/Resource>
    WAITING FOR: <what needs to happen to unblock>
    DISCOVERED: <if blocking issue is new, create with discovered-from>"
    ```
  - If blocker is another task, create dependency: `bd dep add <blocked_task> <blocker_task>`
- If Beads not enabled, skip silently

## 5. Confirm
Announce task is blocked.
