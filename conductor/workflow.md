# Development Workflow

## Overview

This project follows context-driven development with TDD practices for quality and maintainability.

## Development Cycle

### 1. Plan → Spec → Implement

1. **Track Creation**: Define feature/bug in a track with spec and phased plan
2. **Spec Review**: Ensure acceptance criteria are clear and testable
3. **Implementation**: Follow TDD cycle for each task

### 2. TDD Cycle (Red-Green-Refactor)

```
1. Write failing test (Red)
2. Write minimal code to pass (Green)
3. Refactor while keeping tests green
4. Commit with conventional message
```

### 3. Task Workflow

```
[ ] Task pending
[~] Task in progress
[x] Task completed (include commit SHA)
[!] Task blocked (include reason)
```

## Commit Convention

Use conventional commits for clear history:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, no code change
refactor: code restructure
test: add tests
chore: maintenance
```

### Examples

```bash
git commit -m "feat: add custom tool dialog component"
git commit -m "fix: handle missing config file gracefully"
git commit -m "test: add unit tests for sidebar component"
git commit -m "refactor: extract file operations to separate module"
```

## Code Quality

### Before Committing

```bash
# Frontend
pnpm typecheck    # No TypeScript errors
pnpm lint         # No ESLint warnings
pnpm test         # All tests pass

# Backend
cd src-tauri
cargo clippy      # No Rust warnings
cargo test        # All tests pass
```

### Code Review Checklist

- [ ] TypeScript strict mode satisfied
- [ ] No `any` types without justification
- [ ] Error handling in place
- [ ] No hardcoded values (use constants)
- [ ] Follows existing patterns in codebase

## Testing Strategy

### Frontend (Vitest)

- Unit tests for utility functions
- Component tests with React Testing Library
- Integration tests for Zustand stores

### Backend (Cargo Test)

- Unit tests for core logic
- Integration tests for Tauri commands
- Test cross-platform path handling

### Coverage Target

Aim for >80% coverage on new code.

## Branch Strategy

```
main                    # Production-ready
├── feat/feature-name   # New features
├── fix/bug-name        # Bug fixes
└── refactor/area       # Refactoring
```

## Phase Verification

At the end of each implementation phase:

1. Run all quality checks
2. Manually verify functionality
3. Update plan.md with completion status
4. Request user verification if needed

## Documentation

- Update README.md for user-facing changes
- Update DESIGN.md for architectural changes
- Add inline comments only for complex logic
- Prefer self-documenting code

## Security Practices

1. Never commit secrets or API keys
2. Validate all file paths (prevent traversal)
3. Use atomic file writes
4. Create backups before destructive operations
5. Follow principle of least privilege for Tauri capabilities
