import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should apply variant classes', () => {
    render(<Button variant="gradient">Gradient</Button>)
    const button = screen.getByRole('button', { name: 'Gradient' })
    expect(button.className).toContain('bg-gradient-to-r')
  })

  it('should forward ref', () => {
    let ref: HTMLButtonElement | null = null
    render(<Button ref={(el) => { ref = el }}>Ref</Button>)
    expect(ref).toBeInstanceOf(HTMLButtonElement)
  })
})
