# Spec: Fix Backup Restore Logic (Reversed File Operations)

## Overview

The "Restore this backup" feature in the History panel has reversed logic - it overwrites the backup file with current config content instead of restoring the backup content to the current config file.

## Problem Description

**Expected Behavior:**
- When user clicks "Restore this backup", the selected backup file's content should be copied to the current config file
- The backup file should remain unchanged
- The current config should update to match the backup

**Actual Behavior:**
- The current config file remains unchanged
- The backup file gets overwritten with the current config content
- Effectively destroys the backup instead of restoring it

## Reproduction Steps

1. Open the application and select any tool with a config file
2. Make some changes to the config and save (creates a backup)
3. Open the History panel
4. Select a backup from the list
5. Click "Restore this backup"
6. **Observe:** The backup file content changes to match current config; current config unchanged

## Functional Requirements

1. **FR-1:** "Restore this backup" MUST copy backup content → current config file
2. **FR-2:** The backup file MUST remain unchanged after restore operation
3. **FR-3:** Editor content MUST update to reflect restored content

## Acceptance Criteria

- [ ] Clicking "Restore this backup" writes backup content to current config path
- [ ] Backup file remains intact after restore
- [ ] Editor reflects the restored content immediately
- [ ] Success toast confirms restore operation

## Out of Scope

- Changing backup file naming or storage location
- Adding confirmation dialog before restore
