import type { ComponentFile } from './component.types'

/** Файл в сгенерированном JSON (с содержимым) */
export interface RegistryFile extends ComponentFile {
	content: string
}

/** Итоговый JSON одного компонента */
export interface RegistryEntry {
	name: string
	$schema: string
	type: 'components:ui'
	files: RegistryFile[]
	dependencies: string[]
	registryVersion: number
	registryDependencies: string[]
}
