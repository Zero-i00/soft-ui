/** Конфигурационный файл проекта пользователя */
export interface ProjectConfig {
	$schema: string
	registryUrl: string
	tsx: boolean
	aliases: {
		components: string
		ui: string
		utils: string
	}
	theme: {
		file: string
		palette: string
		radius: string
		spacing: string
		icons: string
		darkMode: 'data-attribute' | 'class'
	}
}
