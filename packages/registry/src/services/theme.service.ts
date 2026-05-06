import { IS_CLIENT } from '../constants/root.constants'
import type { ResolvedTheme, Theme } from '../types/theme.types'

export const STORAGE_KEY = 'theme'
export const ATTRIBUTE = 'data-theme'
export const PREFER = '(prefers-color-scheme: dark)'

export function apply(theme: ResolvedTheme) {
	if (!IS_CLIENT) return
	document.documentElement.setAttribute(ATTRIBUTE, theme)
}

export function getSystem(): ResolvedTheme {
	if (!IS_CLIENT) return 'light'
	return window.matchMedia(PREFER).matches ? 'dark' : 'light'
}

export function getStored(): Theme {
	if (!IS_CLIENT) return 'system'
	const stored = localStorage.getItem(STORAGE_KEY)
	if (stored === 'light' || stored === 'dark') return stored
	return 'system'
}

export function setStored(value: Theme) {
	if (!IS_CLIENT) return
	if (value === 'system') localStorage.removeItem(STORAGE_KEY)
	else localStorage.setItem(STORAGE_KEY, value)
}

export function getResolved(): ResolvedTheme {
	const stored = getStored()
	return stored === 'system' ? getSystem() : stored
}
