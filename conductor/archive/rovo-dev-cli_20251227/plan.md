# Plan: Add Rovo Dev CLI Predefined Tool Support

## Phase 1: Add Tool Definition

- [x] Task 1.1: Add Rovo Dev CLI to CLI_TOOLS array in `src/utils/cli-tools.ts`
  - [x] Sub-task 1.1.1: Define tool with id: 'rovo-dev', name: 'Rovo Dev CLI', icon: '🔷'
  - [x] Sub-task 1.1.2: Add suggestedConfigs for config.yml (~/.rovodev/config.yml, YAML format)
  - [x] Sub-task 1.1.3: Add suggestedConfigs for mcp.json (~/.rovodev/mcp.json, JSON format)
  - [x] Sub-task 1.1.4: Set docsUrl to Atlassian support page

- [x] Task 1.2: Add tool icon mapping in `src/constants/tool-icons.tsx`
  - [x] Sub-task 1.2.1: Add 'rovo-dev' icon entry

## Phase 2: Cross-Platform Path Support

- [x] Task 2.1: Verify path expansion handles ~/.rovodev/ correctly
  - [x] Sub-task 2.1.1: Test ~ expansion on macOS/Linux
  - [x] Sub-task 2.1.2: Test %USERPROFILE% expansion on Windows (via Rust backend)

## Phase 3: Testing & Verification

- [ ] Task 3.1: Manual testing
  - [ ] Sub-task 3.1.1: Create ~/.rovodev/ directory with sample config files
  - [ ] Sub-task 3.1.2: Verify tool appears in sidebar when directory exists
  - [ ] Sub-task 3.1.3: Verify both config.yml and mcp.json are editable
  - [ ] Sub-task 3.1.4: Verify syntax highlighting (YAML for config, JSON for mcp)
  - [ ] Sub-task 3.1.5: Verify save with backup works correctly

- [x] Task 3.2: Run quality gates
  - [x] Sub-task 3.2.1: pnpm typecheck
  - [x] Sub-task 3.2.2: pnpm lint
  - [x] Sub-task 3.2.3: pnpm test (pre-existing failures unrelated to changes)
  - [x] Sub-task 3.2.4: cargo test (all 33 tests pass)
  - [x] Sub-task 3.2.5: cargo clippy
