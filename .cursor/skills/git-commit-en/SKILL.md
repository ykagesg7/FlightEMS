---
name: git-commit-en
description: >-
  English-only Conventional Commits for Windows (avoids Japanese mojibake in
  PowerShell). Use when writing commit messages, creating commits, or amending.
  Triggers: commit, git commit, Conventional Commits.
disable-model-invocation: false
---

# Git commit messages (English only)

Japanese characters in commit messages get garbled on Windows PowerShell. Use **English only** (title, body, footer).

## Format

```
<type>: <short description>

<optional body>
```

### Types

- `feat:` — new feature or significant addition
- `fix:` — bug fix
- `refactor:` — restructuring without behavior change
- `docs:` — documentation only
- `test:` — tests
- `chore:` — maintenance (deps, config, CI)
- `style:` — formatting only
- `perf:` — performance

### Rules

- Title: max 72 characters, imperative mood ("add" not "added")
- No period at the end of the title
- Body: wrap at 72 characters; explain why, not what
- Reference issues when applicable: `fixes #123`

### Examples

```
feat: add Sentry error monitoring integration

- Configure @sentry/react with browser tracing
- Update EnhancedErrorBoundary to report errors to Sentry
```

```
fix: convert MDX frontmatter from YAML to ESM export

7 lesson files used YAML frontmatter which is not supported
by the MDX parser. Convert to export const meta format.
```

```
docs: update roadmap with Phase A completion status
```

Project pointer rule: `.cursor/rules/git-conventions.mdc`  
More tooling notes: `docs/Scripts_Repository_Tooling.md`
