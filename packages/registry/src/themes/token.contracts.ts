/**
 * Контракт дизайн-токенов.
 *
 * Правила:
 * 1. Каждый пресет оси ОБЯЗАН определить ВСЕ переменные из своей секции.
 * 2. Компоненты ссылаются ТОЛЬКО на переменные из этого контракта.
 * 3. При добавлении новой переменной — добавь её во ВСЕ существующие пресеты.
 * 4. Порядок секций при генерации theme.css: base → palette → typography → radius → spacing → icons → elevation.
 */

/**
 * Описание осей и их переменных. Ключ — ось, значение — список CSS-переменных,
 * которые обязан определить каждый пресет этой оси.
 */
export const TOKEN_CONTRACT = {
	base: [
		// ── Константы ────────────────────────────────────────────────────────
		'--color-white',
		'--color-black',

		// ── Z-index scale ───────────────────────────────────────────
		'--z-base',
		'--z-dropdown',
		'--z-sticky',
		'--z-overlay',
		'--z-modal',
		'--z-toast',

		// ── Component sizes (высоты интерактивных элементов) ────────
		'--size-xs',
		'--size-sm',
		'--size-md',
		'--size-lg',
		'--size-xl',

		// ── Opacity ─────────────────────────────────────────────────
		'--opacity-disabled',
		'--opacity-overlay',

		// ── Border widths ───────────────────────────────────────────
		'--border-width-thin',
		'--border-width-thick',
		'--border-width-focus',

		// ── Motion ──────────────────────────────────────────────────
		'--duration-fast',
		'--duration-normal',
		'--duration-slow',
		'--easing-standard',
		'--easing-emphasized'
	],
	palette: [
		// ── Semantic colors (стабильны в light/dark) ─────────────────────────

		// Primary
		'--color-primary-100',
		'--color-primary-200',
		'--color-primary-300',
		'--color-primary-400',
		'--color-primary-500',
		'--color-primary-600',
		'--color-primary-700',
		'--color-primary-800',
		'--color-primary-900',

		'--color-primary-opacity-lighter',
		'--color-primary-opacity-light',
		'--color-primary-opacity-main',
		'--color-primary-opacity-dark',
		'--color-primary-opacity-darker',

		'--color-primary-shadow-sm',
		'--color-primary-shadow-md',
		'--color-primary-shadow-lg',

		// Secondary
		'--color-secondary-100',
		'--color-secondary-200',
		'--color-secondary-300',
		'--color-secondary-400',
		'--color-secondary-500',
		'--color-secondary-600',
		'--color-secondary-700',
		'--color-secondary-800',
		'--color-secondary-900',

		'--color-secondary-opacity-lighter',
		'--color-secondary-opacity-light',
		'--color-secondary-opacity-main',
		'--color-secondary-opacity-dark',
		'--color-secondary-opacity-darker',

		'--color-secondary-shadow-sm',
		'--color-secondary-shadow-md',
		'--color-secondary-shadow-lg',

		// Info
		'--color-info-100',
		'--color-info-200',
		'--color-info-300',
		'--color-info-400',
		'--color-info-500',
		'--color-info-600',
		'--color-info-700',
		'--color-info-800',
		'--color-info-900',

		'--color-info-opacity-lighter',
		'--color-info-opacity-light',
		'--color-info-opacity-main',
		'--color-info-opacity-dark',
		'--color-info-opacity-darker',

		'--color-info-shadow-sm',
		'--color-info-shadow-md',
		'--color-info-shadow-lg',

		// Success
		'--color-success-100',
		'--color-success-200',
		'--color-success-300',
		'--color-success-400',
		'--color-success-500',
		'--color-success-600',
		'--color-success-700',
		'--color-success-800',
		'--color-success-900',

		'--color-success-opacity-lighter',
		'--color-success-opacity-light',
		'--color-success-opacity-main',
		'--color-success-opacity-dark',
		'--color-success-opacity-darker',

		'--color-success-shadow-sm',
		'--color-success-shadow-md',
		'--color-success-shadow-lg',

		// Warning
		'--color-warning-100',
		'--color-warning-200',
		'--color-warning-300',
		'--color-warning-400',
		'--color-warning-500',
		'--color-warning-600',
		'--color-warning-700',
		'--color-warning-800',
		'--color-warning-900',

		'--color-warning-opacity-lighter',
		'--color-warning-opacity-light',
		'--color-warning-opacity-main',
		'--color-warning-opacity-dark',
		'--color-warning-opacity-darker',

		'--color-warning-shadow-sm',
		'--color-warning-shadow-md',
		'--color-warning-shadow-lg',

		// Error
		'--color-error-100',
		'--color-error-200',
		'--color-error-300',
		'--color-error-400',
		'--color-error-500',
		'--color-error-600',
		'--color-error-700',
		'--color-error-800',
		'--color-error-900',

		'--color-error-opacity-lighter',
		'--color-error-opacity-light',
		'--color-error-opacity-main',
		'--color-error-opacity-dark',
		'--color-error-opacity-darker',

		'--color-error-shadow-sm',
		'--color-error-shadow-md',
		'--color-error-shadow-lg'
	],
	neutral: [
		// ── Surfaces (layout) ─────────────────────────────────────
		'--surface-body', // фон страницы
		'--surface-card', // карточка, модалка, меню
		'--surface-popover', // dropdown, popover, tooltip
		'--surface-inset', // утопленный: table-header, code block, input bg
		'--surface-inverse', // контрастная: snackbar, toast

		// ── Surfaces (interactive states) ─────────────────────────
		'--surface-hover', // hover на прозрачных элементах (ghost button, list item)
		'--surface-active', // pressed / active state
		'--surface-selected', // выделенный элемент (sidebar active, selected row)
		'--surface-disabled', // фон disabled input, skeleton shimmer

		// ── Fills (непрозрачные фоны для компонентов) ─────────────
		'--fill-soft', // badge, tag, chip, kbd
		'--fill-soft-hover',
		'--fill-strong', // secondary button bg
		'--fill-strong-hover',

		// ── Text ──────────────────────────────────────────────────
		'--text-primary',
		'--text-secondary',
		'--text-disabled',
		'--text-inverse',
		'--text-link',
		'--text-placeholder', // было --neutral-placeholder

		// ── Icons ─────────────────────────────────────────────────
		'--icon-default', // основной цвет иконок
		'--icon-soft', // приглушённые иконки (hint, secondary action)

		// ── Borders ───────────────────────────────────────────────
		'--border-default',
		'--border-strong',
		'--separator',

		// ── Neutral opacity ───────────────────────────────────────
		'--neutral-opacity-lighter',
		'--neutral-opacity-light',
		'--neutral-opacity-main',
		'--neutral-opacity-dark',
		'--neutral-opacity-darker',

		// ── Overlay & Shadow ──────────────────────────────────────
		'--color-overlay',
		'--color-shadow-xs',
		'--color-shadow-sm',
		'--color-shadow-md',
		'--color-shadow-lg',
		'--color-shadow-xl'
	],
	typography: [
		// ── Font families ─────────────────────────────────────────────────────
		'--typography-family-sans',
		'--typography-family-mono',
		'--typography-family-display',

		// ── Headings ──────────────────────────────────────────────────────────
		'--typography-size-h1',
		'--typography-height-h1',
		'--typography-weight-h1',

		'--typography-size-h2',
		'--typography-height-h2',
		'--typography-weight-h2',

		'--typography-size-h3',
		'--typography-height-h3',
		'--typography-weight-h3',

		'--typography-size-h4',
		'--typography-height-h4',
		'--typography-weight-h4',

		'--typography-size-h5',
		'--typography-height-h5',
		'--typography-weight-h5',

		'--typography-size-h6',
		'--typography-height-h6',
		'--typography-weight-h6',

		// ── Subtitles ─────────────────────────────────────────────────────────
		'--typography-size-subtitle-1',
		'--typography-height-subtitle-1',
		'--typography-weight-subtitle-1',

		'--typography-size-subtitle-2',
		'--typography-height-subtitle-2',
		'--typography-weight-subtitle-2',

		// ── Body ──────────────────────────────────────────────────────────────
		'--typography-size-body-1',
		'--typography-height-body-1',
		'--typography-weight-body-1',

		'--typography-size-body-2',
		'--typography-height-body-2',
		'--typography-weight-body-2',

		// ── Caption ───────────────────────────────────────────────────────────
		'--typography-size-caption',
		'--typography-height-caption',
		'--typography-weight-caption',
		'--typography-letter-spacing-caption',

		// ── Overline ──────────────────────────────────────────────────────────
		'--typography-size-overline',
		'--typography-weight-overline',
		'--typography-transform-overline',
		'--typography-letter-spacing-overline'
	],
	radius: [
		'--radius-xs',
		'--radius-sm',
		'--radius-md',
		'--radius-lg',
		'--radius-xl',
		'--radius-full'
	],
	spacing: ['--space-xs', '--space-sm', '--space-md', '--space-lg', '--space-xl', '--space-2xl'],
	icons: ['--icon-xs', '--icon-sm', '--icon-md', '--icon-lg', '--icon-xl'],
	elevation: [
		'--elevation-0',
		'--elevation-1',
		'--elevation-2',
		'--elevation-3',
		'--elevation-4',
		'--elevation-5'
	]
} as const

/** Имена всех осей контракта, включая base. */
export type TokenContract = keyof typeof TOKEN_CONTRACT

/** Оси с пресетами (всё, кроме base). */
export type PresetContract = Exclude<TokenContract, 'base'>

/** CSS-переменные указанной оси. */
export type TokenOf<T extends TokenContract> = (typeof TOKEN_CONTRACT)[T][number]

/** CSS-переменные всех осей. */
export type AnyToken = TokenOf<TokenContract>
