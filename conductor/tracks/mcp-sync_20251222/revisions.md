# Revisions: MCP Settings Sync

## Revision 1

**Date**: 2025-12-22
**Type**: Spec & Plan
**Phase/Task when discovered**: Phase 6 (Integration & Polish)

### What Triggered This Revision

During implementation, several scope expansions and technical discoveries were made that deviate from the original spec and plan:

1. **Amp Dotted Key Format**: Discovered that Amp uses literal dotted keys (`"amp.mcpServers"`) rather than nested JSON objects. Required backend changes to detect and preserve this format.

2. **Data Preservation Requirements**: Tool-specific fields (`url`, `_target`, unknown metadata) were being lost during sync. Required model expansion.

3. **Enhanced Conflict Resolution UX**: Original spec called for basic conflict resolution; implementation evolved into a full interactive UI with preview capabilities.

4. **Phase Consolidation**: Phases 1-3 were implemented simultaneously rather than with manual verification between each phase.

### Changes Made

#### Spec Changes

**FR-1 (MCP Source Management)**:
- Added FR-1.5: Support `url` field for HTTP/SSE-based MCP servers (e.g., Amp)

**FR-2 (Target Tool Configuration)**:
- Added FR-2.4: Preserve tool-specific metadata fields during sync
- Added FR-2.5: Handle literal dotted-key JSON formats (Amp compatibility)

**FR-4 (Preview & Conflict Resolution)**:
- Expanded FR-4.3: Full interactive conflict resolution modal with per-server choices
- Added FR-4.4: Preview final config JSON after resolution choices
- Added FR-4.5: Individual tool sync triggers preview modal first

**New Model Fields**:
- `McpServer.url` - For HTTP/SSE servers
- `McpServer.target` - For tool-specific `_target` fields
- `McpServer.extra` - HashMap for preserving unknown metadata

#### Plan Changes

**Phase 4-5 Tasks Updated**:
- Task 5.3 expanded: Full conflict resolution modal with "Use Source" / "Keep Current" choices
- New Task 5.3b: Config preview modal showing final JSON result
- Task 5.1 updated: Individual sync now triggers preview first

**Verification Tasks**:
- Removed manual verification between Phases 1-3 (consolidated implementation)
- Kept verification for Phases 4-6

### Rationale

These changes were necessary to:
1. Maintain data fidelity across different tool config formats
2. Provide users with clear visibility into sync operations
3. Prevent accidental data loss when syncing between tools
4. Support real-world config variations discovered during testing

### Impact

- No breaking changes to existing functionality
- Enhanced user experience with preview and conflict resolution
- Better compatibility with Amp and tools using non-standard formats
- Slightly larger scope but higher quality outcome
