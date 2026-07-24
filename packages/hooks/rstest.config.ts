import { pluginReact } from '@rsbuild/plugin-react'
import { defineConfig } from '@rstest/core'

export default defineConfig({
	plugins: [pluginReact()],
	testEnvironment: 'jsdom',
	globals: true,
	setupFiles: ['./test-setup.ts'],
	passWithNoTests: true
})
