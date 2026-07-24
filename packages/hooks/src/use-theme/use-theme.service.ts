import { IS_CLIENT } from '../constants'
import type { ResolvedTheme, Theme } from './use-theme.types'

class ThemeService {
	readonly STORAGE_KEY = 'theme'
	readonly ATTRIBUTE = 'data-theme'
	readonly PREFER = '(prefers-color-scheme: dark)'

	private readonly listeners = new Set<() => void>()
	private systemListenerReady = false

	getTheme = (): Theme => {
		if (!IS_CLIENT) return 'system'
		const stored = localStorage.getItem(this.STORAGE_KEY)
		if (stored === 'light' || stored === 'dark') return stored
		return 'system'
	}

	getResolved = (): ResolvedTheme => {
		const stored = this.getTheme()
		return stored === 'system' ? this.getSystem() : stored
	}

	setTheme = (theme: Theme) => {
		if (!IS_CLIENT) return
		if (theme === 'system') localStorage.removeItem(this.STORAGE_KEY)
		else localStorage.setItem(this.STORAGE_KEY, theme)
		this.apply(this.getResolved())
		this.notify()
	}

	toggleTheme = () => {
		this.setTheme(this.getResolved() === 'light' ? 'dark' : 'light')
	}

	subscribe = (listener: () => void): (() => void) => {
		this.initSystemListener()
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	private getSystem(): ResolvedTheme {
		if (!IS_CLIENT) return 'light'
		return window.matchMedia(this.PREFER).matches ? 'dark' : 'light'
	}

	private apply(resolved: ResolvedTheme) {
		if (!IS_CLIENT) return
		document.documentElement.setAttribute(this.ATTRIBUTE, resolved)
	}

	private notify() {
		for (const listener of this.listeners) listener()
	}

	/** Реагирует на смену системной темы, только пока выбран 'system'. */
	private initSystemListener() {
		if (!IS_CLIENT || this.systemListenerReady) return
		this.systemListenerReady = true
		window.matchMedia(this.PREFER).addEventListener('change', () => {
			if (this.getTheme() !== 'system') return
			this.apply(this.getSystem())
			this.notify()
		})
	}
}

export const themeService = new ThemeService()
