# AGENTS.md

Development conventions and commands for CLI Config Editor.

## Quick Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm tauri dev

# Build
pnpm tauri build

# Frontend only (no Tauri)
pnpm dev

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format

# Test frontend
pnpm test

# Test Rust
cd src-tauri && cargo test

# Rust check
cd src-tauri && cargo clippy

# Generate app icons from SVG
pnpm tauri icon public/icon.svg
```

## System Dependencies (Ubuntu/Debian)

```bash
sudo apt-get install -y \
  libgtk-3-dev \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libsoup-3.0-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

## Project Structure

```
src/                    # Frontend (TypeScript + React)
src-tauri/              # Backend (Rust)
docs/                   # Documentation
```

## Code Conventions

### TypeScript/React

- Use functional components with hooks
- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Use named exports
- File naming: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- Component naming: PascalCase

### Rust

- Follow Rust 2021 edition idioms
- Use `thiserror` for error types
- Use `serde` for serialization
- Prefer `Result<T, E>` over panics
- Module naming: snake_case

### Styling

- Use Tailwind CSS utility classes
- Avoid custom CSS when Tailwind suffices
- Dark mode: use `dark:` variants

### State Management

- Use Zustand for global state
- Use React Query for async server state
- Keep component state local when possible

## Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, no code change
refactor: code restructure
test: add tests
chore: maintenance
```

## Testing

- Frontend: Vitest + React Testing Library
- Backend: Rust built-in tests
- E2E: Playwright (future)
