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

## 5. BEADS COMPACTION (Optional)

**PROTOCOL: Compact Beads history for archived tracks.**

1. **Check Beads Config:**
   - Read `conductor/beads.json`
   - If file doesn't exist or `compactOnArchive: false`, skip this section

2. **Compact Archived Track Epics:**
   - For each archived track with `beads_epic` in metadata:
     - Run `bd compact <epic_id>`
   - Announce: "Compacted Beads history for archived tracks."

3. **Offer Project-Wide Compaction:**
   > "Would you like to compact all completed Beads tasks?"
   > A) Yes - Compact all completed tasks project-wide
   > B) No - Only compact archived tracks
   
   If A: Run `bd compact --all`

**CRITICAL:** If `bd` commands fail, log warning but do NOT halt archive operation.
