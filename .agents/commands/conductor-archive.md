---
description: Archive completed tracks
---

# Conductor Archive

Archive completed tracks to clean up the project.

## 1. Find Completed Tracks
List all `[x]` tracks from `tracks.md`.

## 2. Select Tracks
- Archive all completed
- Or select specific ones
- Or cancel

## 3. Archive Process
For each selected track:
1. Create `conductor/archive/` if needed
2. Move track folder to archive
3. Remove from `tracks.md`
4. Add archive comment

## 4. Commit
Commit the archive operation.

---

## 5. BEADS COMPACTION

**PROTOCOL: Compact Beads history for archived tracks.**

1. **Check for Beads CLI:**
   - Run `which bd`
   - **If NOT found:**
     > "⚠️ Beads CLI (`bd`) is not installed. Beads provides persistent task memory across sessions."
     > "A) Continue archive without Beads compaction"
     > "B) Stop - I'll install Beads first"
     - If A: Skip this section
     - If B: HALT and wait for user

2. **Compact Archived Track Epics:**
   - For each archived track with `beads_epic` in metadata:
     - Run `bd compact --auto <epic_id>`
   - **If any `bd` command fails:**
     > "⚠️ Beads command failed: <error message>"
     > "A) Continue archive without Beads compaction"
     > "B) Retry the failed command"
     > "C) Stop - I'll fix the issue first"
     - If A: Skip remaining Beads steps
     - If B: Retry the command
     - If C: HALT and wait for user
   - Announce: "Compacted Beads history for archived tracks."

3. **Offer Project-Wide Compaction:**
   > "Would you like to compact all completed Beads tasks?"
   > A) Yes - Compact all completed tasks project-wide
   > B) No - Only compact archived tracks
   
   If A: Run `bd compact --auto --all`
