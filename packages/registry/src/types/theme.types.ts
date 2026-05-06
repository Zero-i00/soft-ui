/** JSON одного пресета темы */
export interface ThemePresetEntry {
	css: string
	axis: string
	name: string
	$schema: string
	registryVersion: number
}

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'
