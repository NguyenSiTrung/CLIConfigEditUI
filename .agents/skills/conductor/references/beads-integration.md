# Beads Integration Reference

## Overview

Conductor integrates with [Beads](https://github.com/lostinspiration/beads) to provide persistent task memory that survives context compaction. This creates a hybrid system:

- **Conductor**: Human-readable specs and plans
- **Beads**: Agent-optimized task state with dependency tracking

## How It Works

### Ownership Model

| Component | Conductor Owns | Beads Owns |
|-----------|----------------|------------|
| Specs | `spec.md` (requirements) | — |
| Plans | `plan.md` (task list) | — |
| Task State | Status markers `[ ]` `[~]` `[x]` | Full state + dependencies |
| Memory | Session-bound | Cross-session persistent |

### Track → Epic Mapping

Each Conductor track becomes a Beads epic:

```
conductor/tracks/auth_20250115/
├── spec.md          # Conductor: requirements
├── plan.md          # Conductor: task breakdown
└── metadata.json    # Links to Beads epic ID
```

```
.beads/epics/auth_20250115.md   # Beads: persistent state
```

### Bidirectional Sync

1. **plan.md → Beads**: Tasks created/updated in plan sync to Beads
2. **Beads → plan.md**: Status changes reflect back to plan markers
3. **Conflict resolution**: Beads state is authoritative for status

## Configuration

Enable integration via `conductor/beads.json`:

```json
{
  "enabled": true,
  "auto_sync": true,
  "epic_prefix": "conductor",
  "sync_on_implement": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Enable/disable Beads integration |
| `auto_sync` | boolean | Sync on every task completion |
| `epic_prefix` | string | Prefix for Beads epic IDs |
| `sync_on_implement` | boolean | Sync before `/conductor-implement` |

## Command Mapping

| Conductor Command | Beads Operations | Description |
|-------------------|------------------|-------------|
| `/conductor-setup` | `bd init` | Initialize Beads in project |
| `/conductor-newtrack` | `bd create` (epic + tasks) | Create epic with linked tasks |
| `/conductor-implement` | `bd ready` → `bd update` → `bd done` | Get next task, track progress, complete |
| `/conductor-status` | `bd ready`, `bd show` | Show available tasks, epic status |
| `/conductor-block` | `bd update --status blocked` | Mark task blocked with reason |
| `/conductor-skip` | `bd update --status skipped` | Skip task with justification |
| `/conductor-archive` | `bd compact` | Archive completed epics |

### Example Flow

```bash
# User runs /conductor-implement

# 1. Conductor checks Beads for ready tasks
bd ready --epic auth_20250115

# 2. Agent works on task, updates status
bd update TASK-001 --status in_progress

# 3. On completion
bd done TASK-001 --note "Implemented JWT validation"

# 4. Conductor updates plan.md markers
[x] Task 1: Implement JWT validation <!-- SHA: abc123 -->
```

## Benefits

### Cross-Session Memory
- Task state persists across context compaction
- Agent resumes exactly where it left off
- No re-reading of entire plan.md needed

### Dependency-Aware Selection
- `bd ready` returns only unblocked tasks
- Respects task dependencies defined in plan
- Prevents out-of-order execution

### Audit Trail
- Every status change logged in Beads
- Notes attached to task completions
- Full history survives compaction

## Fallback Behavior

### Graceful Degradation

```
┌─────────────────────────────────────┐
│ Is `bd` installed?                  │
│   YES → Use Beads integration       │
│   NO  → Conductor works standalone  │
└─────────────────────────────────────┘
```

### Failure Handling

| Scenario | Behavior |
|----------|----------|
| `bd` not installed | Conductor operates normally without Beads |
| `bd` command fails | Log warning, continue with plan.md only |
| Sync conflict | Beads state wins, plan.md updated |
| `.beads/` missing | Auto-initialize on next command |

### Detection Logic

```python
# Pseudo-code for integration check
def should_use_beads():
    if not shutil.which("bd"):
        return False
    if not Path("conductor/beads.json").exists():
        return False
    config = load_json("conductor/beads.json")
    return config.get("enabled", False)
```

## Quick Reference

```bash
# Check if Beads is available
which bd

# Initialize integration
bd init
echo '{"enabled": true}' > conductor/beads.json

# View current state
bd show --epic conductor_<track_id>

# See what's ready to work on
bd ready
```
