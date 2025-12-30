# Plan: SSH Remote Config Path for Custom Tools

## Phase 1: Backend SSH Infrastructure

### Task 1.1: SSH Command Abstraction
- [x] Create `src-tauri/src/ssh/` module (commit: phase1-task1)
- [x] Implement `SshConnection` struct with host, user, port, path fields
- [x] Create `parse_ssh_path()` function to parse `user@host:/path` format
- [x] Add support for SSH config alias resolution
- [x] Write unit tests for path parsing

### Task 1.2: Remote File Operations
- [x] Implement `ssh_read_file()` command using system `ssh cat`
- [x] Implement `ssh_write_file()` command using `ssh` with stdin pipe
- [x] Implement `ssh_file_exists()` check command
- [x] Implement `ssh_backup_file()` for remote backup before write
- [x] Add timeout handling (10s default)
- [x] Write integration tests with mock SSH

### Task 1.3: Connection Status Management
- [x] Create `SshStatus` enum: Connected, Disconnected, Error(String)
- [x] Implement `ssh_test_connection()` command for status check
- [x] Add connection caching to avoid repeated handshakes
- [x] Implement retry logic with exponential backoff (3 attempts)

### Task 1.4: Tauri Command Exposure
- [x] Expose `read_remote_config` command
- [x] Expose `write_remote_config` command
- [x] Expose `check_remote_connection` command
- [x] Expose `test_ssh_host` command for validation
- [x] Update Tauri capabilities for new commands

## Phase 2: Frontend Types and State

### Task 2.1: Type Definitions
- [x] Add `PathType` enum: `'local' | 'ssh'`
- [x] Extend `CustomTool` type with `pathType`, `sshHost` fields
- [x] Create `SshConnectionStatus` type
- [x] Create `RemoteToolConfig` interface

### Task 2.2: State Management
- [x] Add SSH connection status to app store
- [x] Create `useRemoteConnection` hook for status management
- [x] Add auto-reconnect logic in hook
- [x] Persist custom tool SSH config in storage

## Phase 3: UI Components

### Task 3.1: Path Type Selector
- [x] Create `PathTypeSelector` component (Local | SSH Remote)
- [x] Style with Tailwind, match existing UI patterns
- [x] Add keyboard accessibility

### Task 3.2: SSH Path Input Fields
- [x] Create `SshPathInput` component with Host and Path fields
- [x] Add validation for SSH host format
- [x] Add "Test Connection" button with status feedback
- [x] Show inline validation errors

### Task 3.3: Update Custom Tool Dialog
- [x] Integrate `PathTypeSelector` into custom tool dialog
- [x] Conditionally render local path or SSH inputs based on selection
- [x] Update form submission to include SSH fields
- [x] Handle edit mode for existing remote tools

### Task 3.4: Connection Status Indicator
- [x] Create `ConnectionStatusBadge` component
- [x] Show in sidebar next to remote tool name
- [ ] Add tooltip with error details on hover
- [x] Style states: green (connected), gray (disconnected), red (error)

## Phase 4: Integration

### Task 4.1: Editor Integration
- [x] Update editor loading logic to detect remote tools
- [x] Call `read_remote_config` for SSH path tools
- [x] Show loading spinner during remote fetch
- [x] Display connection errors in editor area

### Task 4.2: Save Integration
- [x] Update save logic to detect remote tools
- [x] Call `write_remote_config` for SSH path tools
- [x] Trigger remote backup before save
- [x] Show save progress for remote operations

### Task 4.3: Auto-Reconnect Integration
- [x] Implement reconnect on transient failures
- [x] Add manual "Reconnect" button for failed connections
- [x] Show reconnection attempts in status

## Phase 5: Testing and Polish

### Task 5.1: Unit Tests
- [x] Test SSH path parsing edge cases
- [x] Test connection status state transitions
- [x] Test UI component rendering states

### Task 5.2: Integration Tests
- [x] Test full flow: add remote tool → load → edit → save
- [x] Test error scenarios: timeout, auth failure, host unreachable
- [x] Test auto-reconnect behavior

### Task 5.3: Cross-Platform Validation
- [x] Verify SSH commands work on Linux
- [ ] Verify SSH commands work on macOS
- [ ] Verify OpenSSH works on Windows

### Task 5.4: Documentation
- [x] Update README with remote config feature
- [x] Add user guide for SSH setup requirements
- [x] Document troubleshooting for common SSH issues
