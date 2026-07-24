import type { ClassValue } from './cn.types'

function toValue(input: ClassValue): string {
	if (!input || input === true) return ''

	if (typeof input === 'string' || typeof input === 'number') return String(input)

	if (Array.isArray(input)) return cn(...input)

	let result = ''
	for (const key in input) {
		if (input[key]) result += result ? ' ' + key : key
	}

	return result
}

/**
 * Объединяет CSS-классы (clsx-совместимо): строки, числа, вложенные массивы,
 * объекты `{ класс: условие }`. Falsy-значения отбрасываются.
 *
 *   cn(styles.root, disabled && styles.disabled, { [styles.open]: isOpen }, className)
 */
export function cn(...inputs: ClassValue[]): string {
	let result = ''

	for (const input of inputs) {
		const value = toValue(input)
		if (value) result += result ? ' ' + value : value
	}

	return result
}
