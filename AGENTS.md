# soft-ui

React UI kit with copy-paste component distribution. Public OSS (MIT)

## What we're aiming for

- **No Tailwind.** Only CSS Modules + CSS variables. Components never hardcode colors/sizes — only `var(--...)` from the token contract.
- **Our own accessibility primitives** (Slot, Portal, FocusTrap, Dismissable, RovingFocus…) — no Radix. `@soft-ui/primitives` is the only runtime dependency of copied components.
- **Multi-axis themes.** Axes: base / palette / neutral / typography / radius / spacing / icons / elevation. Each axis has presets, any combination is valid. `TOKEN_CONTRACT` (`packages/registry/src/themes/token.contracts.ts`) is the single source of truth for CSS variables: every preset must define all variables of its axis, components reference only contract slots.
- **Light/dark** via `data-theme` on `<html>`. Semantic colors (primary/secondary/info/success/warning/error, 100–900 scale + opacity + shadow) are stable across themes; only neutral (surfaces, grays, shadows) is adaptive.
- **Our own CLI** (planned): `init` / `add <component>` / `theme set --radius sharp`. The registry generates JSON — the CLI's public versioned contract.

## Monorepo structure

- `packages/registry` — `@soft-ui/registry`, private. Tokens and contract, themes (10 palettes + paired neutrals, radius/spacing/icons/typography/elevation presets, `base.css`), theme runtime (`theme.service.ts`, `useTheme` hook, anti-FOUC `themeScript`), registry manifest types. Never published — source of truth for JSON generation.
- `packages/primitives` — `@soft-ui/primitives`, published (esm+cjs+dts). Stub for now (`version`), primitives will live here.
- `packages/hooks` — `@soft-ui/hooks`, published (esm+cjs+dts). Stub for now (`version`), hooks will live here.
- `apps/book` — Next.js 16 / React 19, docs/playground. Before working in it, read its `AGENTS.md` (Next 16 has breaking changes).

## Toolchain

pnpm + Turborepo, Node ≥20. Lint — oxlint, format — prettier, typecheck — tsgo (`@typescript/native-preview`), build — rslib, tests — rstest (jsdom + testing-library), releases — changesets, commits — conventional (husky + commitlint).
