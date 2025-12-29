# Spec: GitHub Actions Release Build

## Overview

Set up GitHub Actions workflow to automatically build and release CLI Config Editor for all major platforms (macOS, Windows, Linux) when a version tag is pushed or manually triggered.

## Functional Requirements

### FR-1: Build Targets
- Build macOS universal binary (Intel + Apple Silicon)
- Build Windows installer (.msi and/or .exe)
- Build Linux packages (.deb, .AppImage)

### FR-2: Workflow Triggers
- Trigger on git tag push matching `v*` pattern (e.g., `v0.1.0`)
- Support manual workflow dispatch from GitHub Actions UI

### FR-3: Artifact Publishing
- Upload built binaries to GitHub Releases automatically
- Store workflow artifacts for 90-day retention

### FR-4: Build Process
- Install system dependencies for each platform
- Install Rust toolchain and Node.js/pnpm
- Run quality checks (typecheck, lint, clippy)
- Execute `pnpm tauri build` for production builds

## Non-Functional Requirements

### NFR-1: Build Matrix
- Use GitHub-hosted runners: `ubuntu-latest`, `macos-latest`, `windows-latest`
- Parallel builds across platforms for faster CI

### NFR-2: Caching
- Cache Cargo dependencies and pnpm modules for faster builds

## Acceptance Criteria

- [ ] Pushing a version tag (e.g., `v0.1.0`) triggers builds on all 3 platforms
- [ ] Manual dispatch from Actions tab works
- [ ] Built artifacts appear in GitHub Releases
- [ ] Workflow artifacts downloadable from Actions run

## Out of Scope

- Code signing and notarization (can be added later)
- Auto-update manifest generation
- Platform-specific testing in CI
