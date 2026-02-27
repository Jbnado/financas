import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('CSS theme configuration', () => {
  const cssContent = fs.readFileSync(
    path.resolve(__dirname, '../index.css'),
    'utf-8',
  )

  // Extract @theme block for precise variable validation
  const themeBlock = cssContent.match(/@theme\s*\{([\s\S]*?)\}/)?.[1] ?? ''
  const baseBlock = cssContent.match(/@layer base\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''

  it('should define dark background color variable', () => {
    expect(themeBlock).toContain('--color-background: #0f172a')
  })

  it('should define card color variable', () => {
    expect(themeBlock).toContain('--color-card: #1e293b')
  })

  it('should define foreground text color variable', () => {
    expect(themeBlock).toContain('--color-foreground: #f1f5f9')
  })

  it('should define semantic positive color #6ee7a0', () => {
    expect(themeBlock).toContain('--color-positive: #6ee7a0')
  })

  it('should define semantic negative color #fca5a5', () => {
    expect(themeBlock).toContain('--color-negative: #fca5a5')
  })

  it('should define semantic warning color #fcd34d', () => {
    expect(themeBlock).toContain('--color-warning: #fcd34d')
  })

  it('should define semantic neutral color', () => {
    expect(themeBlock).toContain('--color-neutral:')
  })

  it('should configure tabular-nums on body', () => {
    expect(baseBlock).toContain('font-variant-numeric: tabular-nums')
  })

  it('should apply Inter font family on body', () => {
    expect(baseBlock).toContain('font-family: var(--font-sans)')
  })

  it('should define Inter as font-sans in theme', () => {
    expect(themeBlock).toMatch(/--font-sans:.*'Inter'/)
  })
})
