# React UI Kit — архитектура и воркфлоу

Документ основан на выбранной стратегии: copy-paste дистрибуция (как shadcn), CSS Modules + CSS-переменные, свои примитивы, публичный OSS.

---

## 1. Архитектура монорепо

Используем **pnpm workspaces + Turborepo**. Одна репа, несколько пакетов и приложений.

```
yourkit/
├── apps/
│   └── www/                      # Docs site (Next.js), он же хост registry JSON
│       ├── app/
│       ├── content/docs/         # MDX документация компонентов
│       ├── public/r/             # Сгенерированные registry JSON (публичный URL)
│       └── registry.config.ts
│
├── packages/
│   ├── cli/                      # npx yourkit ... — публикуется в npm
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── init.ts
│   │   │   │   ├── add.ts
│   │   │   │   └── diff.ts
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── primitives/               # @yourkit/primitives — runtime-пакет, публикуется в npm
│   │   ├── src/
│   │   │   ├── slot/
│   │   │   ├── portal/
│   │   │   ├── focus-trap/
│   │   │   ├── dismissable-layer/
│   │   │   └── roving-focus/
│   │   └── package.json
│   │
│   ├── registry/                 # Источник истины для копируемых компонентов
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── button.module.css
│   │   │   │   │   └── meta.ts      # manifest компонента
│   │   │   │   └── dialog/...
│   │   │   ├── themes/
│   │   │   │   ├── neutral.css
│   │   │   │   ├── ocean.css
│   │   │   │   └── ...
│   │   │   └── lib/
│   │   │       └── cn.ts            # утилита classnames, тоже копируется
│   │   ├── scripts/
│   │   │   └── build-registry.ts    # генерит JSON в apps/www/public/r/
│   │   └── package.json            # приватный, не публикуется
│   │
│   ├── eslint-config/              # общий конфиг
│   ├── tsconfig/                   # общие tsconfig base файлы
│   └── test-utils/                 # хелперы для тестов примитивов
│
├── .changeset/                     # Changesets для версионирования
├── .github/workflows/              # CI/CD
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Что публикуется в npm

Только два пакета:

- `@yourkit/cli` (или просто `yourkit`) — CLI
- `@yourkit/primitives` — runtime-примитивы

Всё остальное — приватное (`"private": true` в package.json). `registry` не публикуется никогда, он существует чтобы из него генерился JSON.

### Зачем Turborepo

Быстрые инкрементальные сборки и кеш. Когда ты меняешь один компонент, пересобирается только registry и docs, а не весь мир. Плюс, `turbo run test` запускает тесты только в затронутых пакетах.

---

## 2. Как работает registry

Ключевая идея: **исходники компонентов лежат в `packages/registry/src/components/`**, это обычные `.tsx` + `.module.css` файлы, которые работают в docs-приложении как обычные импорты. Отдельный скрипт (`build-registry.ts`) **читает эти файлы и генерит JSON**, который публикуется на `yourkit.dev/r/button.json`.

### Manifest компонента

В каждой папке компонента лежит `meta.ts`:

```ts
// packages/registry/src/components/button/meta.ts
import type { ComponentMeta } from '../../types'

export const meta: ComponentMeta = {
	name: 'button',
	type: 'components:ui',
	// npm-зависимости, которые CLI установит пользователю
	dependencies: ['@yourkit/primitives'],
	// другие компоненты из реестра, от которых этот зависит
	registryDependencies: [],
	// файлы, которые нужно скопировать в проект пользователя
	files: [
		{ path: 'button.tsx', target: 'components/ui/button.tsx' },
		{ path: 'button.module.css', target: 'components/ui/button.module.css' }
	]
}
```

### Генерируемый JSON

Скрипт `build-registry.ts` обходит все `meta.ts`, читает содержимое файлов и кладёт в `apps/www/public/r/button.json`:

```json
{
	"name": "button",
	"type": "components:ui",
	"dependencies": ["@yourkit/primitives"],
	"registryDependencies": [],
	"files": [
		{
			"path": "button.tsx",
			"target": "components/ui/button.tsx",
			"content": "import styles from './button.module.css';\nimport { Slot } from '@yourkit/primitives';\n..."
		},
		{
			"path": "button.module.css",
			"target": "components/ui/button.module.css",
			"content": ".root { background: var(--color-primary); ... }"
		}
	]
}
```

Этот JSON — публичный контракт CLI. Он должен быть версионирован и обратно совместим.

### Что важно

- **CSS Modules работают из коробки** — ты копируешь `.tsx` и `.module.css` рядом, и импорт `import styles from './button.module.css'` просто работает у пользователя (если у него настроен любой современный бандлер: Vite, Next, Webpack 5).
- Компонент **никогда не обращается к хардкоженным цветам** — только к CSS-переменным типа `var(--color-primary)`. Эти переменные определяет `theme.css`, который копируется на шаге `init`.
- `registryDependencies` позволяет цепочки: `Dialog` зависит от `Button`, `Combobox` — от `Input` и `Popover`. CLI рекурсивно резолвит граф.

---

## 3. Темы и палитры

### Структура файла палитры

```css
/* packages/registry/src/themes/ocean.css */
:root {
	--color-bg: #ffffff;
	--color-fg: #0a1628;
	--color-primary: #0066cc;
	--color-primary-fg: #ffffff;
	--color-muted: #f0f4f8;
	--color-border: #d0d9e2;
	/* ... */

	--radius-sm: 4px;
	--radius-md: 8px;
	--font-sans: system-ui, sans-serif;
}

[data-theme='dark'] {
	--color-bg: #0a1628;
	--color-fg: #e6f0fa;
	--color-primary: #4da3ff;
	--color-primary-fg: #0a1628;
	--color-muted: #162033;
	--color-border: #2a3748;
	/* ... */
}
```

Темная тема переключается добавлением `data-theme="dark"` на `<html>` или `<body>` — пользователь сам решает как, ты в документации показываешь несколько стандартных способов (системная тема через `prefers-color-scheme`, ручной тоггл, next-themes).

### Контракт переменных

Это критично: **все компоненты используют одно и то же множество CSS-переменных**. У тебя должен быть задокументированный список (`tokens.md`), и любая новая палитра обязана определить их все — иначе компоненты сломаются. Добавь автотест: парсить каждый `theme/*.css`, проверять, что все переменные из контракта присутствуют.

### Расширение: свои палитры пользователем

В документации покажи: «скопируй `ocean.css`, переименуй, поменяй значения, подключи». Никакой магии не нужно.

---

## 4. CLI

### Команды

**`npx yourkit init`** — запускается один раз в проекте. Интерактивно спрашивает:

1. TypeScript или JavaScript?
2. Куда складывать компоненты? (default: `components/ui`)
3. Куда класть глобальный CSS с темой? (default: `app/globals.css` или `src/styles/theme.css`)
4. Какую палитру? (список из registry)
5. Использовать CSS-переменную dark-mode через `data-theme` или `.dark` класс?

Создаёт `yourkit.json` в корне проекта:

```json
{
	"$schema": "https://yourkit.dev/schema.json",
	"style": "default",
	"palette": "ocean",
	"tsx": true,
	"aliases": {
		"components": "@/components",
		"ui": "@/components/ui",
		"utils": "@/lib/utils"
	},
	"theme": {
		"file": "app/globals.css",
		"darkMode": "data-attribute"
	}
}
```

И копирует выбранную палитру в указанный CSS-файл (или дописывает в конец).

**`npx yourkit add button`** — читает `yourkit.json`, идёт на `https://yourkit.dev/r/button.json`, резолвит registryDependencies рекурсивно, скачивает все файлы, кладёт по target-путям, устанавливает npm-зависимости через детектор пакетного менеджера (pnpm/npm/yarn/bun). Если файл уже существует — спрашивает overwrite или показывает diff.

**`npx yourkit diff button`** — показывает, что изменилось в upstream с момента когда пользователь скопировал компонент. Полезно когда ты исправил баг и хочешь, чтобы юзеры об этом узнали.

**`npx yourkit add --all`** — сразу всё (для экспериментов).

### Технический стек CLI

- [`commander`](https://www.npmjs.com/package/commander) или `cac` для парсинга аргументов
- [`prompts`](https://www.npmjs.com/package/prompts) для интерактивных вопросов
- [`execa`](https://www.npmjs.com/package/execa) для запуска `pnpm install` и т.п.
- [`ora`](https://www.npmjs.com/package/ora) для спиннеров
- [`kleur`](https://www.npmjs.com/package/kleur) для цветного вывода
- [`zod`](https://www.npmjs.com/package/zod) для валидации ответов registry и `yourkit.json`
- [`diff`](https://www.npmjs.com/package/diff) для команды diff
- [`tsup`](https://tsup.egoist.dev/) для сборки CLI в один bundled файл

Собираем CLI в один CJS-файл с шебангом, публикуем в npm с полем `"bin": { "yourkit": "./dist/index.js" }`.

### Важная тонкость

CLI не должен хардкодить URL registry — должен быть конфиг по умолчанию + возможность переопределить через `yourkit.json` (`"registryUrl": "..."`). Это нужно и для тестов, и чтобы компании могли держать приватные форки.

---

## 5. Примитивы (`@yourkit/primitives`)

Это единственная runtime-зависимость. Пиши их максимально атомарно — один примитив, одна задача.

### Минимальный набор, чтобы строить основные компоненты

- **Slot** — паттерн `asChild` (передаёт props дочернему элементу вместо рендера обёртки). Прочитай как реализован в Radix — там ~100 строк, но каждая строка важна (`React.cloneElement`, мерж рефов, мерж обработчиков событий).
- **Portal** — рендер в `document.body`, с поддержкой SSR.
- **FocusTrap** — для Dialog, Popover. Нужна правильная обработка `Tab`/`Shift+Tab`, восстановление фокуса при закрытии, поиск первого фокусируемого элемента.
- **DismissableLayer** — слой, который закрывается по `Escape`, клику снаружи, блюру. С поддержкой вложенности (открытый Dialog внутри другого Dialog).
- **RovingFocus** — для Menu, Tabs, RadioGroup. Только один элемент в `tabindex=0`, стрелки переключают фокус.
- **useControllableState** — хук для контролируемых/неконтролируемых компонентов (как `value` + `defaultValue` одновременно).
- **useId** — SSR-safe ID (с React 18 это `useId` из React, просто реэкспорт).
- **Presence** — управляет монтированием при анимациях (чтобы элемент оставался в DOM пока идёт exit-анимация).

**Честный совет**: начни с Slot, Portal, FocusTrap, DismissableLayer, useControllableState. На этом уже можно сделать Button, Input, Dialog, Popover — MVP из 6–8 компонентов. RovingFocus и Presence добавляй, когда дойдёшь до Menu и анимированных Dialog.

### Тестирование примитивов

- Unit: **Vitest + @testing-library/react**
- A11y: **@testing-library/jest-dom** + вручную проверяй клавиатурные сценарии
- Обязательно: visual regression не нужен для примитивов, но нужен **интеграционный тест** — смонтировать Dialog и пройти его клавиатурой от открытия до закрытия.

---

## 6. GitHub setup

### Базовая настройка репозитория

1. **Branch protection на `main`**:
   - Require pull request before merging
   - Require status checks: `lint`, `typecheck`, `test`, `build`
   - Require branches to be up to date
   - Disallow force push
   - Require linear history (squash merge only)

2. **CODEOWNERS** — даже если ты один, это полезно для будущих контрибьюторов.

3. **Issue templates** — bug report, feature request, component request.

4. **PR template** — чеклист: тесты, документация, changeset добавлен.

5. **Labels**: `type:bug`, `type:feature`, `area:cli`, `area:primitives`, `area:component:button`, `good first issue`.

### Changesets для версионирования

Устанавливаешь `@changesets/cli`, инициализируешь (`pnpm changeset init`). В `.changeset/config.json` настраиваешь, какие пакеты публикуются (`cli` и `primitives`), какие игнорируются (`registry`, `www`).

Воркфлоу: каждый PR, который меняет публичный пакет, обязан содержать changeset-файл (`pnpm changeset`) с описанием изменения и семвером (patch/minor/major). Бот Changesets открывает в `main` PR «Version Packages», который бампит версии и обновляет CHANGELOG. Мердж этого PR запускает публикацию.

### CI (GitHub Actions)

**`.github/workflows/ci.yml`** — на каждый PR и push в main:

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run lint typecheck test build
      - run: pnpm --filter registry build # генерит registry JSON
      - run: pnpm --filter www build # проверяет, что docs собираются
```

**`.github/workflows/release.yml`** — публикация на push в main:

```yaml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write # для npm provenance
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run build
      - uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
          version: pnpm changeset version
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**`.github/workflows/deploy-docs.yml`** — деплой docs-сайта (Vercel/Cloudflare Pages), который раздаёт registry JSON.

### Секреты в репозитории

- `NPM_TOKEN` — токен с правом публикации пакетов (лучше automation token с 2FA bypass)
- `VERCEL_TOKEN` / ключ провайдера деплоя

### Conventional commits

Не обязательно, но желательно. Changesets сами по себе описывают изменения, но commitlint + conventional commits делают историю читаемой.

---

## 7. Workflow разработки нового компонента

Шаги при добавлении, скажем, `Checkbox`:

1. **Ветка от main**: `feat/checkbox`.

2. **Создай папку** `packages/registry/src/components/checkbox/`:
   - `checkbox.tsx` — сам компонент, использует CSS-модуль и, если нужно, примитивы
   - `checkbox.module.css` — стили, только через CSS-переменные
   - `meta.ts` — manifest
   - `checkbox.test.tsx` — тесты
   - `checkbox.stories.tsx` — опционально, Ladle/Storybook для визуальной разработки

3. **Запусти docs в dev-режиме** — `pnpm dev` в `apps/www`. Компонент подключается как обычный импорт из `@yourkit/registry/components/checkbox`, ты его видишь вживую.

4. **Напиши тесты** — клавиатура, ARIA, контролируемый/неконтролируемый режим, disabled, форма (интеграция с `<form>` через скрытый input).

5. **Напиши документацию** — `apps/www/content/docs/components/checkbox.mdx`:
   - Описание
   - Установка: `npx yourkit add checkbox`
   - Примеры (live preview из того же исходника)
   - API reference (props)
   - Accessibility notes (какие ARIA-паттерны используются, какая клавиатура)

6. **Добавь в индекс registry** — `packages/registry/src/index.ts`, чтобы `build-registry` его подхватил.

7. **Запусти `pnpm changeset`** — опиши изменение. Для нового компонента это обычно `minor` в `@yourkit/cli` (если CLI не меняется — то без changeset, компонент появится в registry автоматически после деплоя docs).

8. **Локальная проверка CLI**: `pnpm --filter cli build && node packages/cli/dist/index.js add checkbox --registry http://localhost:3000/r` в тестовом проекте.

9. **PR → review → merge** → CI деплоит docs → JSON доступен по публичному URL → юзеры могут `npx yourkit add checkbox`.

### Что проверять на code review компонента

- Нет хардкоженных цветов, размеров, шрифтов — только `var(--...)`
- Все интерактивные состояния покрыты (`:hover`, `:focus-visible`, `:active`, `:disabled`, `[aria-invalid]`)
- `focus-visible`, не `focus` (не показывать кольцо при клике мышью)
- Клавиатурная навигация соответствует [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/)
- `aria-*` атрибуты корректны
- Компонент работает в RTL (`dir="rtl"`)
- SSR-safe (никаких `window`/`document` без `useEffect` или `typeof window`)
- Next.js App Router: если компонент использует хуки или события — первая строка файла `"use client";`

---

## 8. Рекомендуемый roadmap

**Неделя 1–2: фундамент**

- Инициализация монорепо (pnpm + turbo)
- Настройка tsconfig, eslint, prettier, vitest
- Скелет `packages/primitives` с Slot, Portal, useControllableState
- Скелет `packages/cli` с командой `init` (без `add` пока)
- Один тестовый компонент `Button` в registry
- Скрипт `build-registry`
- Настройка docs-сайта (Next.js)

**Неделя 3: CLI**

- Команда `add` с резолвингом зависимостей
- Детектор пакетного менеджера
- Обработка конфликтов файлов
- Тесты CLI (`vitest` + временные папки)

**Неделя 4: GitHub + публикация**

- Настройка Actions, Changesets
- Первая публикация `@yourkit/primitives@0.1.0` и `yourkit@0.1.0` в npm
- Деплой docs, проверка end-to-end: `npx yourkit init && npx yourkit add button` в чистом Next-проекте

**Неделя 5+: компоненты**
Порядок добавления (от простых к сложным):

1. Button, Input, Label, Textarea, Badge, Avatar, Separator
2. Checkbox, Switch, RadioGroup (уже нужна своя клавиатурная логика)
3. Dialog, Popover, Tooltip (FocusTrap, DismissableLayer)
4. DropdownMenu, ContextMenu (RovingFocus)
5. Tabs, Accordion
6. Select (самое сложное — клавиатура, typeahead, портал, позиционирование)
7. Combobox, Toast, Sheet
8. DatePicker (опционально — большой труд)

---

## 9. Ловушки, на которые легко напороться

1. **CSS Modules и скоуп**. Имена классов хешируются локально, но CSS-переменные — глобальные. Это норма, но помни: переменная `--color-primary` одна на всё приложение, а класс `.root` у тебя уникален в каждом модуле. Не перенеси по ошибке переменные в `:local`.

2. **SSR и Portal**. `document` не существует на сервере. Делай `const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), []); if (!mounted) return null;` или проверку `typeof window !== "undefined"`.

3. **`"use client"` в Next App Router**. Любой компонент с хуком или событием должен начинаться с этой директивы. Это значит, что при копировании файла CLI должен сохранить её — не вырезай пустые строки сверху.

4. **Focus trap и iOS**. На iOS Safari фокус в overlay работает странно, если элемент не `tabindex="-1"`. Тестируй на реальном устройстве.

5. **Версионирование registry JSON**. Если ты однажды изменишь формат (например, переименуешь поле `target` в `path`), старые версии CLI сломаются. Добавь поле `$schema` и версию формата с первого дня: `"registryVersion": 1`. CLI должен уметь отказаться работать с неизвестной версией.

6. **Обновление примитивов ломает скопированные компоненты**. Если ты в `Slot` поменяешь сигнатуру — все скопированные `Button`, `Dialog`, `Menu` у пользователей сломаются. Правила: примитивы держат стабильный API до следующего мажора, breaking changes синхронизируются с обновлением компонентов и документируются в миграционном гайде.

7. **CSS-переменные в dark-режиме и транзишены**. Если ты анимируешь цвет через `transition: background-color 200ms`, переключение темы вызовет анимацию — это часто нежелательно. Добавь в документацию трюк с `.theme-switching *, .theme-switching *::before, .theme-switching *::after { transition: none !important; }` на время переключения.

8. **Телеметрия CLI**. Почти все крупные CLI собирают анонимную статистику. Ты OSS — честно расскажи в README, есть она или нет, и как отключить (`YOURKIT_TELEMETRY=0`). Лучше с первого дня её не добавлять.

9. **Лицензия**. MIT — стандарт для OSS UI-китов. Добавь `LICENSE` в корень с первого коммита.

10. **Не верь регрессионным тестам без визуальной проверки**. Для UI-кита нужен Chromatic или Playwright + screenshot diff хотя бы на ключевых компонентах. Добавь в roadmap после MVP.

---

## 9a. Многоосевые пресеты: палитра + radius + spacing + icons

Тема — это не только цвет. Пользователь при `init` выбирает **несколько независимых осей**, каждая со своим набором пресетов:

| Ось       | Примеры пресетов               | Управляет слотами                                                         |
| --------- | ------------------------------ | ------------------------------------------------------------------------- |
| `palette` | neutral, ocean, forest, sunset | `--color-*`                                                               |
| `radius`  | sharp, soft, round             | `--radius-xs`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl` |
| `spacing` | compact, cozy, spacious        | `--space-xs..xl`                                                          |
| `icons`   | small, medium, large           | `--icon-xs..xl`                                                           |

### Главный принцип: слоты стабильны, значения — переменные

Компоненты **всегда** ссылаются на одни и те же имена слотов (`var(--radius-md)`, `var(--space-sm)` и т.д.) — это публичный контракт, который не меняется. Пресет — это просто файл, который даёт этим слотам конкретные значения. Поэтому оси полностью независимы: любая комбинация работает.

Не путай **size-prop компонента** (`<Button size="sm">` — компонент внутри использует `--space-xs` вместо `--space-md`) и **глобальный spacing-пресет** (`compact` делает все `--space-*` меньше, сохраняя иерархию). Пресет задаёт базис, size-prop — относительную позицию в этом базисе.

### Структура в registry

```
packages/registry/src/themes/
├── palettes/
│   ├── ocean.css
│   ├── forest.css
│   └── ...
├── radius/
│   ├── sharp.css       # --radius-xs: 0; --radius-md: 2px; ...
│   ├── soft.css        # --radius-xs: 2px; --radius-md: 8px; ...
│   └── round.css       # --radius-xs: 6px; --radius-md: 16px; ...
├── spacing/
│   ├── compact.css
│   ├── cozy.css
│   └── spacious.css
└── icons/
    ├── small.css
    ├── medium.css
    └── large.css
```

Пример `radius/soft.css`:

```css
:root {
	--radius-xs: 2px;
	--radius-sm: 4px;
	--radius-md: 8px;
	--radius-lg: 12px;
	--radius-xl: 16px;
}
```

### Контракт слотов (обязательно!)

Заведи файл `packages/registry/src/themes/tokens.contract.ts`:

```ts
export const TOKEN_CONTRACT = {
	palette: [
		'--color-bg',
		'--color-fg',
		'--color-primary',
		'--color-primary-fg',
		'--color-muted',
		'--color-muted-fg',
		'--color-border',
		'--color-destructive',
		'--color-destructive-fg'
		// ...
	],
	radius: ['--radius-xs', '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl'],
	spacing: ['--space-xs', '--space-sm', '--space-md', '--space-lg', '--space-xl'],
	icons: ['--icon-xs', '--icon-sm', '--icon-md', '--icon-lg', '--icon-xl']
} as const
```

И CI-тест: для каждого файла в `themes/<axis>/*.css` распарсить CSS, проверить что ВСЕ переменные из `TOKEN_CONTRACT[axis]` присутствуют. Падает тест — падает PR. Это единственная защита от ситуации «добавил новый пресет, забыл одну переменную, пол-кита ломается у пользователей».

### Секционные маркеры в пользовательском theme.css

CLI не просто конкатенирует выбранные пресеты в `theme.css` — он оборачивает каждый блок в маркеры, чтобы потом уметь их заменять точечно:

```css
/* @yourkit:palette:ocean start */
:root {
	--color-bg: #fff;
	--color-fg: #0a1628; /* ... */
}
[data-theme='dark'] {
	--color-bg: #0a1628; /* ... */
}
/* @yourkit:palette:ocean end */

/* @yourkit:radius:soft start */
:root {
	--radius-xs: 2px;
	--radius-sm: 4px;
	--radius-md: 8px;
	--radius-lg: 12px;
	--radius-xl: 16px;
}
/* @yourkit:radius:soft end */

/* @yourkit:spacing:cozy start */
:root {
	--space-xs: 4px;
	--space-sm: 8px;
	--space-md: 12px;
	--space-lg: 20px;
	--space-xl: 32px;
}
/* @yourkit:spacing:cozy end */

/* @yourkit:icons:medium start */
:root {
	--icon-xs: 12px;
	--icon-sm: 14px;
	--icon-md: 16px;
	--icon-lg: 20px;
	--icon-xl: 24px;
}
/* @yourkit:icons:medium end */
```

Маркеры — часть публичного контракта между CLI и пользовательским файлом. Не удаляй их вручную, иначе `theme set` перестанет работать.

### Обновлённый `yourkit.json`

```json
{
	"theme": {
		"file": "app/globals.css",
		"palette": "ocean",
		"radius": "soft",
		"spacing": "cozy",
		"icons": "medium",
		"darkMode": "data-attribute"
	}
}
```

### Обновлённый CLI

**`yourkit init`** теперь задаёт 4 вопроса по темам (палитра, radius, spacing, icons), а не один. Для каждой оси — показывает название пресета, короткое описание и, опционально, превью значений (например, визуализацию скруглений через Unicode-блоки или просто список `xs=2px sm=4px md=8px ...`).

**Новая команда `yourkit theme set`** — точечное переключение пресета на одной или нескольких осях:

```bash
npx yourkit theme set --radius sharp
npx yourkit theme set --palette forest --spacing compact
npx yourkit theme set                    # интерактивный режим
```

Алгоритм:

1. Читает `yourkit.json`, находит `theme.file`.
2. Для каждой указанной оси: скачивает `https://yourkit.dev/r/themes/<axis>/<preset>.json` (preset-файлы тоже живут в registry как отдельные «компоненты» — `type: "theme:preset"`).
3. Ищет в `theme.file` секцию `/* @yourkit:<axis>:<old-preset> start */ ... end */`, вырезает её целиком.
4. Вставляет новую секцию на то же место.
5. Обновляет `yourkit.json`.

**`yourkit theme list`** — выводит все доступные пресеты по осям. Полезно для discovery.

### Что это даёт на практике

- Юзер поставил kit с `palette=ocean radius=soft spacing=cozy`.
- Через месяц дизайнер говорит «сделай всё плотнее и жёстче» — юзер запускает `npx yourkit theme set --radius sharp --spacing compact`. Один файл `theme.css` изменился в двух местах, ни один компонент трогать не нужно.
- Компоненты, которые юзер уже скопировал себе, продолжают работать — они ссылаются на те же слоты.
- Если юзер хочет собственный пресет — копирует любой существующий файл, переименовывает, меняет значения, подключает вручную (или через `yourkit theme register`, если решишь добавить такую команду позже).

### Как расширять новой осью (например, `typography`)

1. Добавляешь `TOKEN_CONTRACT.typography` со списком слотов (`--font-sans`, `--font-mono`, `--text-xs`, `--text-sm`, ..., `--leading-*`).
2. Создаёшь `packages/registry/src/themes/typography/` с пресетами.
3. Обновляешь `build-registry` — он начинает генерить JSON для новой оси.
4. Обновляешь CLI: добавляешь вопрос в `init` и флаг `--typography` в `theme set`.
5. Релизишь минорную версию CLI. Старые проекты продолжают работать — новая ось у них просто не задана, дефолты в компонентах через fallback: `font-family: var(--font-sans, system-ui, sans-serif);`.

**Правило дефолтов**: в каждом месте, где компонент ссылается на слот новой оси, всегда указывай fallback — чтобы старые проекты, не прошедшие миграцию, не сломались. Без этого любое расширение осей становится breaking change.

---

## 10. Что я оставил за кадром (и советую сделать потом)

- **Иконки** — shadcn использует lucide-react. Рекомендую не делать свой набор, а просто документировать, что примеры используют `lucide-react`.
- **Формы** — интеграция с `react-hook-form` и `zod`. shadcn даёт готовый `Form` компонент-обёртку. Сделай такой же, но не на первой итерации.
- **i18n** — примитивы должны быть нейтральны к языку, но `aria-label` в компонентах надо сделать настраиваемыми через props.
- **RTL** — CSS-логические свойства (`margin-inline-start` вместо `margin-left`) решают 90% проблем. Начни писать стили в логических свойствах с первого компонента.
- **Фигма-кит** — если серьёзно идёшь в OSS, дизайнерам нужен Figma-файл с теми же токенами. Это отдельная большая работа.
