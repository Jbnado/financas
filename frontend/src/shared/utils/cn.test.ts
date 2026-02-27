import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should merge tailwind conflicts correctly', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
  })
})
