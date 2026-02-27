import { describe, it, expect } from 'vitest'

describe('Vitest setup', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have jest-dom matchers available', () => {
    const element = document.createElement('div')
    element.textContent = 'hello'
    document.body.appendChild(element)
    expect(element).toBeInTheDocument()
    document.body.removeChild(element)
  })
})
