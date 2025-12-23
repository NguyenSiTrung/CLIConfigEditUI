# Revisions: kiro-cli_20251223

## Revision 1 - 2025-12-23

**Type:** Both (Spec + Plan)

**Triggered by:** Implementation revealed missing frontend update - Kiro CLI not appearing in sidebar

**Phase/Task when discovered:** Post-implementation verification

**Issue:** 
- Spec only mentioned updating Rust backend (`cli_tools.rs`)
- Frontend has a separate `CLI_TOOLS` constant in `src/utils/cli-tools.ts` that also needs updating
- This pattern exists for all CLI tools but was not documented in the spec

**Changes Made:**

### Spec Changes:
- Added FR-4: Frontend CLI_TOOLS constant update requirement

### Plan Changes:
- Added Task 1.4: Update frontend CLI_TOOLS in `src/utils/cli-tools.ts`

**Rationale:** The app uses a frontend TypeScript constant for rendering the sidebar, separate from the Rust backend definitions. Both must be updated for new CLI tools to appear.

**Impact:** Low - already fixed during implementation, this revision documents the pattern for future tracks.
