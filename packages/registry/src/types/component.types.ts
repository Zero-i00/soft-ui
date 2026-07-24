/** Манифест одного файла внутри компонента */
export interface ComponentFile {
	path: string
	target: string
}

/** Манифест компонента (meta.ts) */
export interface ComponentMeta {
	name: string
	type: 'components:ui'
	dependencies: string[]
	files: ComponentFile[]
	registryDependencies: string[]
}
