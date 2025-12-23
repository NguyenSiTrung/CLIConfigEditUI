# Plan: Fix OpenCode MCP Sync Format

## Phase 1: Update OpenCode Parser (Read)

- [x] Task 1.1: Update `parse_opencode_mcp_servers` function
  - [x] Remove `mcp.servers` nesting - read directly from `mcp.<name>`
  - [x] Parse `command` as array → split into command + args
  - [x] Parse `environment` field → map to `env`
  - [x] Parse `type` field → store for roundtrip
  - [x] Parse `enabled` field → map to `disabled` (inverted)

- [x] Task 1.2: Add unit tests for OpenCode parsing
  - [x] Test parsing native OpenCode format
  - [x] Test parsing with `enabled: false`
  - [x] Test parsing remote server with `url`
  - [x] Test parsing with missing optional fields

## Phase 2: Update OpenCode Writer (Write)

- [x] Task 2.1: Update `servers_to_opencode_format` function
  - [x] Remove `servers` wrapper - write directly to `mcp.<name>`
  - [x] Combine command + args into `command` array
  - [x] Write `environment` instead of `env`
  - [x] Write `type`: `"local"` or `"remote"` based on url presence
  - [x] Write `enabled` field (invert `disabled`)

- [x] Task 2.2: Add unit tests for OpenCode writing
  - [x] Test output matches native OpenCode format
  - [x] Test disabled server gets `enabled: false`
  - [x] Test URL-based server gets `type: "remote"`
  - [x] Test command-based server gets `type: "local"`

## Phase 3: Integration & Sync Logic

- [x] Task 3.1: Update sync integration
  - [x] Verify `write_mcp_to_tool` handles new format correctly
  - [x] Ensure non-MCP fields in opencode.json are preserved

- [x] Task 3.2: Add roundtrip integration test
  - [x] Test: parse → serialize → parse produces identical data

## Phase 4: Verification

- [x] Task 4.1: Manual testing
  - [x] Test with user's actual opencode.json config
  - [x] Verify sync produces correct native format

- [x] Task 4.2: Run all quality checks
  - [x] `cargo clippy` - no warnings
  - [x] `cargo test` - all tests pass
  - [x] `pnpm typecheck` - no errors
