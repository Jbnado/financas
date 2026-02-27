import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Fab } from './Fab'

describe('Fab', () => {
  it('should render a button', () => {
    render(<Fab />)
    expect(screen.getByRole('button', { name: /nova transacao/i })).toBeInTheDocument()
  })

  it('should have gradient classes', () => {
    render(<Fab />)
    const button = screen.getByRole('button', { name: /nova transacao/i })
    expect(button.className).toContain('bg-gradient-to-r')
  })

  it('should have 56px dimensions via w-14 h-14', () => {
    render(<Fab />)
    const button = screen.getByRole('button', { name: /nova transacao/i })
    expect(button.className).toContain('h-14')
    expect(button.className).toContain('w-14')
  })

  it('should be circular via rounded-full', () => {
    render(<Fab />)
    const button = screen.getByRole('button', { name: /nova transacao/i })
    expect(button.className).toContain('rounded-full')
  })
})
