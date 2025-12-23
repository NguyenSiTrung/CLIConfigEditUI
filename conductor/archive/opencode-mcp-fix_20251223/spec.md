# Spec: Fix OpenCode MCP Sync Format

## Overview

The MCP sync functionality produces incorrect output format for OpenCode, causing configuration incompatibility. The current implementation uses a `mcp.servers` wrapper with `command`/`args`/`env` structure, but OpenCode's actual format has servers directly under `mcp` with `command` as an array and `environment` instead of `env`.

## Functional Requirements

### FR-1: Correct OpenCode Format Parsing (Read)
- Parse servers directly from `mcp.<server-name>` (no `servers` wrapper)
- Handle `command` as array (e.g., `["npx", "-y", "package"]`)
- Read `environment` field (not `env`)
- Parse `type` field (`"local"` or `"remote"`)
- Parse `enabled` field (boolean, defaults to `true` if missing)
- Parse `url` field for remote servers
- Parse optional fields: `timeout`, `headers`, `oauth`

### FR-2: Correct OpenCode Format Writing (Write)
- Write servers directly under `mcp.<server-name>` (no `servers` wrapper)
- Write `command` as array combining command + args
- Write `environment` field (not `env`)
- Write `type` field: `"local"` for command-based, `"remote"` for URL-based
- Write `enabled` field: `true` for enabled, `false` for disabled servers
- Preserve all servers including disabled ones

### FR-3: Internal Model Compatibility
- Convert between internal `McpServer` model and OpenCode format seamlessly
- Map: `command` + `args` ↔ `command[]`
- Map: `env` ↔ `environment`
- Map: `disabled` ↔ `!enabled`
- Map: `url` presence → `type: "remote"`

## Non-Functional Requirements

- Backward compatible: existing synced configs should still work after re-sync
- Preserve non-MCP fields in opencode.json during sync

## Acceptance Criteria

1. ✅ Reading OpenCode config with the native format parses all servers correctly
2. ✅ Writing to OpenCode produces format matching official docs structure
3. ✅ Roundtrip test: read → write → read produces identical data
4. ✅ Disabled servers written with `enabled: false`
5. ✅ Remote servers (with URL) get `type: "remote"`
6. ✅ Local servers (with command) get `type: "local"`

## Out of Scope

- OAuth configuration handling (preserve but don't actively manage)
- Headers configuration for remote servers (preserve but don't actively manage)
- Timeout configuration (preserve but don't actively manage)
