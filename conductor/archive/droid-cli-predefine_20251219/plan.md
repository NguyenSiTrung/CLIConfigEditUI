# Plan: Add Factory Droid CLI Predefined Configuration

## Phase 1: Add Droid CLI Tool Definition
*Estimated: 1 task*

### Tasks

- [x] **1.1** Add `droid` tool to `src/utils/cli-tools.ts`
  - Add entry with:
    - `id`: `"droid"`
    - `name`: `"Factory Droid CLI"`
    - `description`: `"AI coding agent for terminal"`
    - `configFiles`: Array with settings.json and mcp.json configs
  - Include platform-specific paths for macOS, Linux, Windows
  - Format: `json`

## Phase 2: Define Configuration Files
*Estimated: 2 tasks*

### Tasks

- [x] **2.1** Add `settings.json` configuration entry
  - macOS/Linux: `~/.factory/settings.json`
  - Windows: `%USERPROFILE%\.factory\settings.json`
  - Format: JSON
  - Description: "Droid CLI settings and preferences"

- [x] **2.2** Add `mcp.json` configuration entry  
  - macOS/Linux: `~/.factory/mcp.json`
  - Windows: `%USERPROFILE%\.factory\mcp.json`
  - Format: JSON
  - Description: "MCP (Model Context Protocol) servers"

## Phase 3: Testing & Verification
*Estimated: 2 tasks*

### Tasks

- [x] **3.1** Verify tool appears in predefined tools list
  - Run `pnpm tauri dev`
  - Check Droid CLI shows in sidebar
  - Verify config files are listed

- [x] **3.2** Test file detection and editing
  - Create test `~/.factory/` directory if needed
  - Verify settings.json detection
  - Verify mcp.json detection
  - Test JSON editing with Monaco editor

## Phase 4: Build Verification
*Estimated: 1 task*

### Tasks

- [x] **4.1** Run typecheck and lint
  - Execute `pnpm typecheck`
  - Execute `pnpm lint`
  - Fix any errors

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1 | Add tool definition |
| 2 | 2 | Define config file paths |
| 3 | 2 | Testing & verification |
| 4 | 1 | Build verification |
| **Total** | **6** | |
