# UI Kit — создание репозитория и развёртывание монорепо

Пошаговая инструкция: от пустого GitHub до работающего `pnpm dev`.

**Стек:** pnpm workspaces + Turborepo + Next.js (docs) + tsup (пакеты) + TypeScript.
**Не используем:** Vite, Lerna, npm/yarn.

---

## 0. Предварительные требования

Убедись, что установлено:

```bash
node --version   # >= 20.x (LTS)
pnpm --version   # >= 9.x
git --version
gh --version     # GitHub CLI — опционально, но сильно упрощает
```

Если нет pnpm:
```bash
npm install -g pnpm@latest
# или через corepack (рекомендуется):
corepack enable
corepack prepare pnpm@latest --activate
```

Если нет GitHub CLI — поставь с [cli.github.com](https://cli.github.com/) и авторизуйся: `gh auth login`.

---

## 1. Создание репозитория на GitHub

### Вариант A: через GitHub CLI (быстрее)

```bash
mkdir yourkit && cd yourkit
git init -b main
gh repo create yourkit \
  --public \
  --description "React UI kit — copy-paste components with themable design tokens" \
  --source=. \
  --remote=origin
```

### Вариант B: через веб-интерфейс

1. Зайди на [github.com/new](https://github.com/new).
2. Имя: `yourkit` (выбери финальное название заранее — переименовывать npm-пакеты потом больно).
3. Public, без README, без .gitignore, без лицензии (всё добавим руками — так контроль полнее).
4. Create repository.
5. Локально:
   ```bash
   mkdir yourkit && cd yourkit
   git init -b main
   git remote add origin git@github.com:<your-username>/yourkit.git
   ```

### Сразу настрой базовые вещи в репозитории

Через веб (`Settings` → ...):
- **General** → Default branch: `main` → Pull Requests: включи только **Allow squash merging**, остальное выключи. Поставь галку «Automatically delete head branches».
- **Branches** → Add branch protection rule для `main`:
  - Require a pull request before merging
  - Require status checks to pass (чекпоинты добавишь, когда появится CI — см. архитектурный документ, раздел 6)
  - Require linear history
  - Do not allow bypassing the above settings
- **Actions** → General → Workflow permissions: **Read and write permissions** (нужно для Changesets).

Пока CI нет, protection rule временно не сработает — это нормально, вернёшься к нему после первого пуша workflow-файлов.

---

## 2. Корневые файлы проекта

Из корня `yourkit/` создай:

### `.gitignore`

```
# deps
node_modules
.pnpm-store

# builds
dist
.next
.turbo
out
build

# env
.env
.env.local
.env.*.local

# logs
*.log
npm-debug.log*
pnpm-debug.log*

# editor / os
.DS_Store
.idea
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json

# tests
coverage
```

### `.nvmrc`

```
20
```

### `.npmrc`

```
# строгое поведение pnpm, чтобы поймать кривые зависимости пораньше
strict-peer-dependencies=false
auto-install-peers=true
shamefully-hoist=false
engine-strict=true

# подсказка editor-ам искать типы в workspace
link-workspace-packages=true
prefer-workspace-packages=true
```

### `package.json` (корневой)

```json
{
  "name": "yourkit",
  "private": true,
  "version": "0.0.0",
  "packageManager": "pnpm@9.12.0",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,md,json,css}\"",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "prettier": "^3.3.0",
    "turbo": "^2.1.0",
    "typescript": "^5.6.0"
  }
}
```

Версию pnpm в `packageManager` возьми реальную из `pnpm --version` — Corepack её потом будет использовать автоматически.

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### `tsconfig.base.json`

Базовый конфиг, от которого наследуются все пакеты:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### `.prettierrc.json`

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

### `LICENSE`

MIT — стандарт для UI-китов. Сгенерируй через `gh repo edit --add-topic` или скачай текст с [choosealicense.com/licenses/mit](https://choosealicense.com/licenses/mit/), впиши год и имя.

### `README.md`

Пока минимальный:

```md
# yourkit

React UI kit with copy-paste components and themable design tokens.

🚧 Work in progress.
```

---

## 3. Первая установка и коммит

```bash
pnpm install
```

На этом шаге pnpm создаст `pnpm-lock.yaml` и `node_modules` с хардлинками из глобального стора. Ничего больше не произойдёт, потому что пакетов в `apps/*` и `packages/*` пока нет.

Проверим, что Turbo видит пустую конфигурацию:

```bash
pnpm turbo run build --dry=json
```

Должен вывести JSON с пустым списком задач — это норма.

---

## 4. Первый пакет: `@yourkit/primitives`

```bash
mkdir -p packages/primitives/src
cd packages/primitives
```

### `packages/primitives/package.json`

```json
{
  "name": "@yourkit/primitives",
  "version": "0.0.0",
  "license": "MIT",
  "sideEffects": false,
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist .turbo"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "tsup": "^8.3.0",
    "typescript": "^5.6.0"
  }
}
```

### `packages/primitives/tsup.config.ts`

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: ["react", "react-dom"],
});
```

### `packages/primitives/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

### `packages/primitives/src/index.ts`

Заглушка, чтобы сборка прошла:

```ts
export const version = "0.0.0";
```

Позже сюда добавятся реальные экспорты (`Slot`, `Portal`, `FocusTrap` и т.д.).

Вернись в корень репозитория:
```bash
cd ../..
pnpm install
pnpm --filter @yourkit/primitives build
```

Должна появиться папка `packages/primitives/dist/` с `index.js`, `index.cjs`, `index.d.ts`.

---

## 5. Первое приложение: `apps/www` (docs на Next.js)

Next.js CLI умеет сам инициализировать проект внутри монорепо:

```bash
cd apps
pnpm create next-app@latest www --typescript --app --no-tailwind --no-src-dir --import-alias "@/*" --no-eslint --use-pnpm
cd www
```

Флаги важны:
- `--no-tailwind` — мы используем чистый CSS + CSS Modules
- `--app` — App Router (нужен для MDX и RSC)
- `--no-eslint` — добавим общий eslint из корня позже
- `--use-pnpm` — не даст CLI случайно позвать npm

### Подправь `apps/www/package.json`

Смени `name` на `@yourkit/www`, добавь приватность и подключи primitives:

```json
{
  "name": "@yourkit/www",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .next .turbo"
  },
  "dependencies": {
    "@yourkit/primitives": "workspace:*",
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.6.0"
  }
}
```

Ключевая строка — `"@yourkit/primitives": "workspace:*"`. Это говорит pnpm: «подключай локальный пакет из workspace, не из npm». Именно так работает монорепо — docs-сайт мгновенно видит изменения в примитивах.

Вернись в корень и переустанови:

```bash
cd ../..
pnpm install
```

pnpm создаст симлинк из `apps/www/node_modules/@yourkit/primitives` на `packages/primitives`.

---

## 6. Проверка, что всё связано

Запусти dev-сервер docs:

```bash
pnpm dev --filter=@yourkit/www
```

Или через Turbo (оно параллельно поднимет `dev` во всех пакетах, где он есть):

```bash
pnpm dev
```

Открой `http://localhost:3000` — должна быть дефолтная страница Next. Чтобы убедиться, что primitives подключены, в `apps/www/app/page.tsx` добавь:

```tsx
import { version } from "@yourkit/primitives";

export default function Home() {
  return <main>Primitives version: {version}</main>;
}
```

Перезагрузи страницу — должна быть строка. Если видишь — весь пайплайн монорепо работает: Turbo → pnpm workspace → Next.js → локальный пакет.

---

## 7. Changesets (версионирование)

```bash
pnpm dlx @changesets/cli init
```

Откроется `.changeset/config.json`. Измени `access` на `"public"` (для публичных npm-пакетов) и добавь в `ignore` пакеты, которые не публикуются:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@yourkit/www"]
}
```

`@yourkit/www` — docs-сайт, не публикуется. Когда появится `packages/registry` (тоже приватный) — добавь и его в `ignore`. `@yourkit/primitives` и будущий `@yourkit/cli` **не** в ignore — они публикуются.

---

## 8. Первый коммит и пуш

```bash
git add .
git commit -m "chore: bootstrap monorepo with turborepo, pnpm, next.js and tsup"
git push -u origin main
```

После первого пуша вернись в GitHub → Settings → Branches и включи branch protection (без required status checks пока — добавишь, когда появится CI workflow).

---

## 9. Что делать дальше

На этом монорепо готово. Следующие шаги (из архитектурного документа):

1. **Добавить `packages/registry`** — приватный пакет с исходниками компонентов и скриптом `build-registry`.
2. **Добавить `packages/cli`** — пакет с CLI на `tsup` + `commander` + `prompts`.
3. **Настроить общие конфиги** — `packages/eslint-config`, `packages/tsconfig` (чтобы не дублировать конфиги в каждом пакете).
4. **Написать первый примитив Slot** и первый компонент Button в registry.
5. **Сделать CI** — `.github/workflows/ci.yml` с `lint + typecheck + test + build`.
6. **Подключить Changesets action** для автоматических релизов.
7. **Задеплоить docs** — Vercel проще всего (`vercel link` из `apps/www`, в настройках проекта указать root directory `apps/www` и build command `cd ../.. && pnpm turbo run build --filter=@yourkit/www`).

---

## 10. Типовые проблемы и решения

**`pnpm install` падает на peer dependencies.**
Проверь `auto-install-peers=true` в `.npmrc`. Если не помогает — смотри, какой peer не резолвится, часто это React между `peerDependencies` пакета и корнем.

**Turbo ругается на отсутствие задачи.**
Проверь, что в `package.json` соответствующего пакета есть скрипт с таким именем. Turbo запускает задачи только там, где они объявлены.

**Next.js не видит `@yourkit/primitives`.**
Убедись, что в корне `pnpm-workspace.yaml` указан `packages/*`, а в `apps/www/package.json` зависимость записана как `"workspace:*"`, а не `"0.0.0"` или `"latest"`.

**TypeScript не подхватывает типы из локального пакета.**
Сделай `pnpm --filter @yourkit/primitives build` хотя бы один раз. Types берутся из `dist/index.d.ts`, которого нет до первой сборки. Для совсем бесшовной разработки можно добавить `paths` в `tsconfig` docs-сайта на исходники примитивов — но это опасно, потому что рантайм и тайпчек начнут расходиться. Лучше держать привычку запускать `pnpm build` в примитивах при изменении их API.

**Vercel не может собрать монорепо.**
В настройках проекта Vercel: Root Directory = `apps/www`, Build Command = `cd ../.. && pnpm turbo run build --filter=@yourkit/www`, Install Command = `cd ../.. && pnpm install`. Либо используй `vercel.json` в корне. Или проще: Turborepo Remote Cache + пресет Vercel «Turborepo» — он всё настроит сам.

**`corepack` не находит pnpm указанной версии.**
Убедись, что Node 20+. Старые Node могут не иметь актуального Corepack. Альтернатива: `npm install -g pnpm@<version>` вручную.
