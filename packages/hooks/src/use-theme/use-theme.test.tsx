import { act, renderHook } from '@testing-library/react'
import { useTheme } from './use-theme'
import { themeService } from './use-theme.service'
import { themeScript } from './use-theme.script'

describe('useTheme', () => {
	beforeEach(() => {
		localStorage.clear()
		document.documentElement.removeAttribute('data-theme')
	})

	it('toggleTheme switches data-theme attribute and persists choice', () => {
		const { result } = renderHook(() => useTheme())
		const before = result.current.resolvedTheme
		const after = before === 'light' ? 'dark' : 'light'

		act(() => result.current.toggleTheme())

		expect(result.current.resolvedTheme).toBe(after)
		expect(document.documentElement.getAttribute('data-theme')).toBe(after)
		expect(localStorage.getItem('theme')).toBe(after)
	})

	it('changeTheme("system") clears stored preference', () => {
		const { result } = renderHook(() => useTheme())

		act(() => result.current.changeTheme('dark'))
		expect(localStorage.getItem('theme')).toBe('dark')

		act(() => result.current.changeTheme('system'))
		expect(localStorage.getItem('theme')).toBeNull()
		expect(result.current.theme).toBe('system')
	})
})

describe('themeScript', () => {
	beforeEach(() => {
		localStorage.clear()
		document.documentElement.removeAttribute('data-theme')
	})

	// Скрипт дублирует логику themeService строкой — тест ловит молчаливое расхождение
	it.each(['dark', 'light', null] as const)(
		'resolves same theme as themeService.getResolved (stored: %s)',
		stored => {
			if (stored) localStorage.setItem(themeService.STORAGE_KEY, stored)

			new Function(themeScript)()

			expect(document.documentElement.getAttribute(themeService.ATTRIBUTE)).toBe(
				themeService.getResolved()
			)
		}
	)
})
