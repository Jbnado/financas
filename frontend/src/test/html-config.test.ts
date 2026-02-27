import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

describe('HTML configuration', () => {
  const htmlContent = fs.readFileSync(
    path.resolve(__dirname, '../../index.html'),
    'utf-8',
  )
  const dom = new JSDOM(htmlContent)
  const doc = dom.window.document

  it('should have lang="pt-BR" on html element', () => {
    expect(doc.documentElement.getAttribute('lang')).toBe('pt-BR')
  })

  it('should have title "financas"', () => {
    expect(doc.title).toBe('financas')
  })

  it('should have viewport meta tag', () => {
    const viewport = doc.querySelector('meta[name="viewport"]')
    expect(viewport).not.toBeNull()
    expect(viewport?.getAttribute('content')).toContain('width=device-width')
  })

  it('should have root div for React mount', () => {
    expect(doc.getElementById('root')).not.toBeNull()
  })
})
