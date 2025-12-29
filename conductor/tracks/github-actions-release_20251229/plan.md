# Plan: GitHub Actions Release Build

## Phase 1: Workflow Setup

- [x] Task 1.1: Create `.github/workflows/release.yml` workflow file
  - [x] Configure workflow name and triggers (tag push `v*`, workflow_dispatch)
  - [x] Define build matrix for ubuntu-latest, macos-latest, windows-latest
  - [x] Set up permissions for releases and contents

- [x] Task 1.2: Configure platform-specific build jobs
  - [x] Linux job: Install system deps (gtk, webkit2gtk, etc.), Rust, pnpm
  - [x] macOS job: Install Xcode CLI tools, Rust, pnpm, configure universal target
  - [x] Windows job: Install Rust, pnpm

- [x] Task 1.3: Add caching for faster builds
  - [x] Cache Cargo registry and target directory
  - [x] Cache pnpm store

## Phase 2: Build and Quality Checks

- [x] Task 2.1: Add quality check steps
  - [x] Run `pnpm typecheck`
  - [x] Run `pnpm lint`
  - [x] Run `cargo clippy` in src-tauri

- [x] Task 2.2: Configure Tauri build step
  - [x] Run `pnpm tauri build` with appropriate flags
  - [x] Handle platform-specific output paths

## Phase 3: Artifact Publishing

- [x] Task 3.1: Upload workflow artifacts
  - [x] Upload built binaries as workflow artifacts per platform
  - [x] Set 90-day retention

- [x] Task 3.2: Publish to GitHub Releases
  - [x] Use softprops/action-gh-release or similar
  - [x] Upload platform binaries to release (only on tag push)
  - [x] Generate release notes from tag

## Phase 4: Verification

- [ ] Task 4.1: Test workflow
  - [ ] Push test tag (e.g., `v0.1.0-test`) to verify builds
  - [ ] Verify artifacts appear in Actions and Releases
  - [ ] Clean up test release if needed
