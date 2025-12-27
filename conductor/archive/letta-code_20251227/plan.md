# Plan: Add Letta Code CLI Predefined Tool

## Phase 1: Add Tool Definition

- [x] Task 1.1: Add Letta Code to predefined tools configuration (commit: pending)
  - [x] Add tool entry with id `letta-code`, name "Letta Code"
  - [x] Configure paths for macOS, Linux, Windows (`~/.letta/settings.json`)
  - [x] Set format as JSON
  - [x] Add website URL (https://docs.letta.com/letta-code)

- [x] Task 1.2: Verify tool detection
  - [x] Run app and confirm Letta Code appears when config exists
  - [x] Verify correct path resolution per platform

## Phase 2: Testing & Validation

- [x] Task 2.1: Manual testing
  - [x] Create test config at `~/.letta/settings.json`
  - [x] Verify tool appears in sidebar
  - [x] Verify JSON editing with syntax highlighting
  - [x] Verify save functionality
  - [x] Verify website link works

- [x] Task 2.2: Run quality checks
  - [x] `pnpm typecheck` - no errors
  - [x] `pnpm lint` - no warnings
  - [x] `cargo clippy` - no warnings

## Phase 3: Documentation

- [x] Task 3.1: Update product.md if needed (no changes needed - predefined tools not listed individually)
- [x] Task 3.2: Commit with conventional message (`feat: add Letta Code CLI predefined tool`)
