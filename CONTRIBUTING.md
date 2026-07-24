# Contributing to soft-stack-ui

Thank you for considering a contribution! This guide will get you from zero to a merged PR.

## Prerequisites

- **Node.js** ≥ 20 — check with `node --version`
- **pnpm** ≥ 9 — install via `corepack enable && corepack prepare pnpm@latest --activate`
- **Git** ≥ 2.30

## Local setup

```bash
git clone https://github.com/Zero-i00/soft-stack-ui.git
cd soft-stack-ui
pnpm install        # also runs `husky` to set up git hooks
pnpm dev            # starts docs site at http://localhost:3000
```

## Development workflow

1. Fork the repo and create a branch from `main`:
   ```bash
   git switch -c feat/my-feature
   ```
2. Make your changes.
3. Run the full check suite before pushing:
   ```bash
   pnpm lint        # biome check across all packages
   pnpm typecheck   # tsc --noEmit across all packages
   pnpm test        # vitest in all packages
   pnpm build       # ensure everything compiles
   ```
4. Open a PR against `main`. Fill in the PR template.

## Adding a component

Follow the workflow in [`docs/ui-kit-architecture.md`](./docs/ui-kit-architecture.md), section 7. In short:

1. Create `packages/registry/src/components/<name>/` with:
   - `<name>.tsx` — component source
   - `<name>.module.css` — styles using only CSS variables (`var(--...)`)
   - `meta.ts` — registry manifest
   - `<name>.test.tsx` — tests
2. No hardcoded colours, sizes, or fonts — only design tokens.
3. Cover keyboard navigation and ARIA per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/).
4. Add docs page at `apps/book/content/docs/components/<name>.mdx`.

## Commit messages

This repo uses [Conventional Commits](https://www.conventionalcommits.org/). Every commit must follow the format:

```
<type>(<scope>): <short description>
```

**Allowed types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Allowed scopes:** `primitives`, `cli`, `registry`, `book`

Examples:

```
feat(primitives): add FocusTrap primitive
fix(primitives): restore focus on unmount in Safari
test(primitives): add keyboard coverage for Dialog
chore: update pnpm to 9.15
```

The `commit-msg` git hook will reject messages that don't conform.

## Changesets

If your change affects a published package (`@soft-stack/primitives` or the CLI), you must add a changeset:

```bash
pnpm changeset
```

Choose the package, pick the semver bump (`patch` / `minor` / `major`), and write a short description. Commit the generated file along with your changes.

> You do **not** need a changeset for docs-only changes or changes to private packages (`registry`, `book`).

## Pull request checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] Changeset added (if `primitives` or CLI changed)
- [ ] Documentation updated (if component added or changed)

## Code review

All PRs are reviewed by [@Zero-i00](https://github.com/Zero-i00). Expect feedback within a few days. PRs are merged via squash merge — your branch will be deleted automatically.
