import { cn } from './cn'

describe('cn', () => {
	it('joins strings and drops falsy', () => {
		expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
	})

	it('supports object syntax', () => {
		expect(cn('a', { b: true, c: false, d: 1 })).toBe('a b d')
	})

	it('flattens nested arrays', () => {
		expect(cn(['a', ['b', { c: true }]], 'd')).toBe('a b c d')
	})

	it('accepts numbers and ignores bare booleans', () => {
		expect(cn(0, 1, true, 'a')).toBe('1 a')
	})
})
