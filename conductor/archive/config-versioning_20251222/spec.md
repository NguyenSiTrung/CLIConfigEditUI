# Spec: Config File Versioning

## Overview

Add the ability for users to save, manage, and switch between different versions of each configuration file. This enables users to maintain separate configurations for different environments (work/personal), experiment safely, create tool-specific profiles, and quickly rollback when needed.

## Functional Requirements

### FR-1: Version Storage
- Each config file can have multiple saved versions
- Versions are stored separately from the active config file
- Versions persist across application restarts

### FR-2: Version Metadata
Each version stores:
- **Name**: User-defined label (e.g., "Work Setup", "Minimal Config")
- **Timestamp**: When the version was created/last modified
- **Description**: Optional notes explaining the version's purpose
- **Source**: Indicator whether auto-saved or manually saved
- **Diff preview**: Ability to show differences from current config

### FR-3: Versions Tab UI
- Dedicated "Versions" tab alongside the editor
- Displays list of all saved versions for the currently selected config file
- Shows version name, timestamp, and source indicator in list
- Expandable to show description and diff preview

### FR-4: Version Operations
| Action | Description |
|--------|-------------|
| Save as Version | Save current editor content as a new named version |
| Load/Apply | Replace current config with selected version |
| Delete | Remove a version (with confirmation) |
| Rename | Update version name |
| Compare | Side-by-side diff between two versions |
| Duplicate | Copy a version as starting point for new one |
| Set as Default | Mark a version to auto-load on app startup |

### FR-5: Default Version Behavior
- One version per config can be marked as "default"
- On app startup, if a default version exists, prompt user or auto-apply
- Visual indicator for the default version in the list

## Non-Functional Requirements

### NFR-1: Performance
- Loading version list should be < 500ms
- Applying a version should be instant

### NFR-2: Data Safety
- Create backup before applying a version (use existing backup system)
- Confirm before overwriting current config with a version

### NFR-3: Storage
- Versions stored locally in app data directory
- No cloud sync (aligns with product privacy goals)

## Acceptance Criteria

- [ ] User can save current config as a named version with optional description
- [ ] User can view all versions for a config in the Versions tab
- [ ] User can load a version to replace current config (with backup)
- [ ] User can delete, rename, and duplicate versions
- [ ] User can compare two versions side-by-side
- [ ] User can set one version as default per config
- [ ] Version data persists after app restart
- [ ] Works for all supported config formats (JSON, YAML, TOML, INI)

## Out of Scope

- Version sync across devices
- Automatic version creation on every save
- Version branching/merging
- Import/export versions (may be future enhancement)
- Undo/redo within version history
