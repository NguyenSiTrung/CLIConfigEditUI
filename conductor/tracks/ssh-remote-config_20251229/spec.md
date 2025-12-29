# Spec: SSH Remote Config Path for Custom Tools

## Overview

Extend custom tool configuration to support SSH remote paths, enabling users to edit config files located on remote VPS, cloud instances, and headless servers directly from CLI Config Editor.

## Functional Requirements

### FR1: Path Type Selection
- Custom tool dialog includes a "Path Type" selector with options: **Local** | **SSH Remote**
- Selecting "Local" shows the existing path input with Browse button
- Selecting "SSH Remote" shows Host and Path input fields

### FR2: SSH Path Configuration
- **Inline SSH path format**: `user@host:/path/to/config.json` (quick one-off)
- **Host alias support**: Reference `~/.ssh/config` aliases (e.g., `myserver:/path/to/config`)
- Host field accepts: `user@hostname`, `user@hostname:port`, or SSH config alias

### FR3: SSH Authentication
- Rely entirely on system SSH agent and `~/.ssh/config`
- No credentials stored in the application
- Support all SSH config features: IdentityFile, ProxyJump, Port, etc.

### FR4: Remote File Operations
- **Read**: Load remote config file content into Monaco Editor
- **Write**: Save editor content back to remote file
- **Existence Check**: Verify remote file exists before loading; offer to create if missing
- **Backup**: Create remote backup before overwriting (`.bak` or timestamped)

### FR5: Connection Status Indicator
- Show connection state in UI: Connected / Disconnected / Error
- Display indicator near tool name or in status bar when remote tool selected
- Show error messages for connection failures (timeout, auth failed, host unreachable)

### FR6: Auto-Reconnect
- Automatically retry connection on transient failures
- Configurable retry attempts (default: 3) with exponential backoff
- User can manually trigger reconnect

### FR7: Saved SSH Hosts (Optional Enhancement)
- Allow saving frequently used SSH hosts in app settings
- Dropdown to select saved hosts when adding remote tools
- Hosts stored locally (no credentials, just `alias → user@host:port` mapping)

## Non-Functional Requirements

### NFR1: Security
- No passwords or private keys stored in application
- All SSH operations delegated to system SSH tools
- Respect `~/.ssh/config` for all connection parameters

### NFR2: Performance
- Connection timeout: 10 seconds (configurable)
- File read/write operations show loading indicator
- Cache connection state to avoid repeated handshakes

### NFR3: Cross-Platform
- Use SSH commands available on all platforms (`ssh`, `scp`, or equivalent)
- Windows: Support OpenSSH (built-in) and PuTTY/Plink detection

## Acceptance Criteria

- [ ] User can add a custom tool with SSH remote path
- [ ] Remote config file loads into editor successfully
- [ ] Changes save back to remote file correctly
- [ ] Connection status indicator shows accurate state
- [ ] Auto-reconnect recovers from transient network issues
- [ ] Error messages are clear and actionable
- [ ] Works with SSH config aliases and ProxyJump setups
- [ ] No credentials stored in app data

## Out of Scope

- SFTP browsing / file picker for remote paths
- SSH key generation or management
- Password authentication handling in-app
- Remote tool auto-detection (only custom tools support remote paths)
- Real-time file watching on remote files
