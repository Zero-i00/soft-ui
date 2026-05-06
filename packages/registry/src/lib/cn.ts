/**
 * Объединяет CSS-классы, отбрасывая falsy-значения.
 *
 *   cn(styles.root, disabled && styles.disabled, className)
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
	return inputs.filter(Boolean).join(' ')
}
