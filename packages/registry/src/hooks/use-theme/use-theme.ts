import { useCallback, useEffect, useState } from 'react'
import {
	apply,
	getResolved,
	getStored,
	getSystem,
	PREFER,
	setStored
} from '../../services/theme.service'
import type { ResolvedTheme, Theme } from '../../types/theme.types'

export function useTheme() {
	const [theme, setTheme] = useState<Theme>('system')
	const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

	useEffect(() => {
		setTheme(getStored())
		setResolvedTheme(getResolved())
	}, [])

	const changeTheme = useCallback((next: Theme) => {
		const resolved: ResolvedTheme = next === 'system' ? getSystem() : next
		setTheme(next)
		setResolvedTheme(resolved)
		apply(resolved)
		setStored(next)
	}, [])

	const toggleTheme = useCallback(() => {
		setResolvedTheme(prev => {
			const next: ResolvedTheme = prev === 'light' ? 'dark' : 'light'
			apply(next)
			setStored(next)
			setTheme(next)
			return next
		})
	}, [])

	useEffect(() => {
		const mq = window.matchMedia(PREFER)
		const handler = () => {
			if (getStored() !== 'system') return
			const sys = getSystem()
			setResolvedTheme(sys)
			apply(sys)
		}
		mq.addEventListener('change', handler)
		return () => mq.removeEventListener('change', handler)
	}, [])

	return { theme, resolvedTheme, changeTheme, toggleTheme }
}
