import { render, screen } from '@testing-library/react'
import { version } from '../index'

describe('toolchain smoke', () => {
	it('exports version', () => {
		expect(version).toBe('0.0.0')
	})

	it('renders into jsdom with jest-dom matchers', () => {
		render(<button type="button">click</button>)
		expect(screen.getByRole('button')).toBeInTheDocument()
	})
})
