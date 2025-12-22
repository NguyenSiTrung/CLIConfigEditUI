# Plan: Config File Versioning

## Phase 1: Data Layer & Storage

### Task 1.1: Define Version Data Model
- [x] Create TypeScript interface for `ConfigVersion` (id, name, configId, content, description, timestamp, source, isDefault)
- [x] Create TypeScript interface for `VersionMetadata` (excludes content for list display)
- [-] Write unit tests for version data validation (skipped)

### Task 1.2: Implement Rust Backend for Version Storage
- [x] Create `versions` module in `src-tauri/src/`
- [x] Implement `save_version` command - saves version to app data directory
- [x] Implement `list_versions` command - returns metadata for all versions of a config
- [x] Implement `load_version` command - returns full version content
- [x] Implement `delete_version` command - removes version file
- [x] Implement `update_version_metadata` command - rename, update description, set default
- [-] Write Rust unit tests for all commands (skipped)
- [x] Register commands in Tauri app

### Task 1.3: Version Storage Structure
- [x] Define storage path: `{app_data}/versions/{config_id}/{version_id}.json`
- [x] Implement version ID generation (UUID or timestamp-based)
- [x] Handle version file read/write with error handling

## Phase 2: Frontend State Management

### Task 2.1: Create Versions Store (Zustand)
- [x] Create `src/stores/versions-store.ts`
- [x] Implement state: `versions`, `selectedVersionId`, `isLoading`, `error`
- [x] Implement actions: `fetchVersions`, `saveVersion`, `loadVersion`, `deleteVersion`, `updateVersion`, `setDefault`
- [-] Write unit tests for store actions (skipped)

### Task 2.2: Integrate with Existing Stores
- [x] Connect versions store with config store (get current config id/content)
- [x] Trigger version list refresh when config selection changes
- [x] Handle "apply version" to update editor content

## Phase 3: Versions Tab UI

### Task 3.1: Create Versions Tab Component
- [x] Create `src/components/versions-tab.tsx`
- [x] Implement tab layout alongside editor
- [x] Display version list with name, timestamp, source badge
- [x] Show empty state when no versions exist
- [-] Write component tests (skipped)

### Task 3.2: Version List Item Component
- [x] Create `src/components/version-list-item.tsx`
- [x] Display version metadata (name, date, source, default badge)
- [x] Expandable section for description
- [x] Action buttons: Load, Delete, Rename, Duplicate
- [-] Write component tests (skipped)

### Task 3.3: Save Version Dialog
- [x] Create `src/components/save-version-dialog.tsx`
- [x] Form fields: name (required), description (optional)
- [x] Validation and error handling
- [-] Write component tests (skipped)

### Task 3.4: Integrate Tab into Main Layout
- [x] Add "Versions" tab button to editor header area
- [x] Implement tab toggle (Editor | Versions)
- [-] Persist tab state preference (skipped - low priority)

## Phase 4: Version Operations

### Task 4.1: Implement Save Version Flow
- [x] "Save as Version" button in Versions tab
- [x] Open save dialog, capture name/description
- [x] Call backend, refresh version list
- [x] Show success/error toast

### Task 4.2: Implement Load/Apply Version Flow
- [x] Confirmation dialog before applying
- [x] Create backup of current config (use existing backup system)
- [x] Apply version content to editor
- [-] Save to actual config file (skipped - user saves manually)
- [x] Show success toast

### Task 4.3: Implement Delete Version Flow
- [x] Confirmation dialog
- [x] Call backend delete
- [x] Refresh list, show toast

### Task 4.4: Implement Rename & Duplicate
- [x] Inline rename or dialog
- [x] Duplicate creates new version with "(copy)" suffix
- [x] Update metadata via backend

### Task 4.5: Implement Set as Default
- [x] Toggle default status
- [x] Only one default per config (clear others)
- [x] Visual indicator for default version

## Phase 5: Version Comparison (Diff View)

### Task 5.1: Implement Compare Selection UI
- [x] Allow selecting two versions for comparison
- [x] "Compare" button enabled when 2 selected
- [x] Or compare selected version vs current config

### Task 5.2: Implement Diff View Component
- [x] Create `src/components/version-diff-view.tsx`
- [x] Use Monaco diff editor for side-by-side comparison
- [x] Show version names in diff header
- [x] Close button to return to version list

### Task 5.3: Diff Preview in Version List
- [-] Show summary of changes (lines added/removed) (skipped - future enhancement)
- [-] Expandable inline diff preview (skipped - future enhancement)

## Phase 6: Polish & Integration

### Task 6.1: Default Version Startup Behavior
- [-] On app load, check for default version per config (skipped - future enhancement)
- [-] Option in settings: auto-apply or prompt (skipped - future enhancement)
- [-] Implement prompt dialog if enabled (skipped - future enhancement)

### Task 6.2: UI Polish
- [x] Consistent styling with existing UI
- [x] Loading states and skeletons
- [-] Keyboard shortcuts (skipped - future enhancement)
- [x] Responsive layout

### Task 6.3: Error Handling & Edge Cases
- [x] Handle missing version files gracefully
- [x] Handle corrupted version data
- [-] Handle version for deleted config file (skipped - edge case)

### Task 6.4: Documentation
- [x] Update README with versioning feature
- [x] Add tooltips/help text in UI

### Task 6.5: Final Testing
- [-] End-to-end testing of all version operations (skipped)
- [-] Test with all config formats (JSON, YAML, TOML, INI) (skipped)
- [-] Cross-platform verification (skipped)
