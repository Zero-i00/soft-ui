'use client'

import { useSyncExternalStore } from 'react'
import { themeService } from './use-theme.service'

export function useTheme() {
	const theme = useSyncExternalStore(
		themeService.subscribe,
		themeService.getTheme,
		() => 'system' as const
	)

	const resolvedTheme = useSyncExternalStore(
		themeService.subscribe,
		themeService.getResolved,
		() => 'light' as const
	)

	return {
		theme,
		resolvedTheme,
		changeTheme: themeService.setTheme,
		toggleTheme: themeService.toggleTheme
	}
}
