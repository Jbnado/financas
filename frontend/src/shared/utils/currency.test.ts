import { describe, it, expect } from 'vitest'
import { formatCurrencyInput, parseCurrencyToDecimal, formatCurrency } from './currency'

describe('formatCurrencyInput', () => {
  it('should format empty string as R$ 0,00', () => {
    expect(formatCurrencyInput('')).toBe('R$\u00a00,00')
  })

  it('should format digits as currency', () => {
    expect(formatCurrencyInput('12345')).toBe('R$\u00a0123,45')
  })

  it('should handle single digit', () => {
    expect(formatCurrencyInput('5')).toBe('R$\u00a00,05')
  })

  it('should strip non-digit characters', () => {
    expect(formatCurrencyInput('R$ 1.234,56')).toBe('R$\u00a01.234,56')
  })
})

describe('parseCurrencyToDecimal', () => {
  it('should parse empty string to 0.00', () => {
    expect(parseCurrencyToDecimal('')).toBe('0.00')
  })

  it('should parse digits to decimal', () => {
    expect(parseCurrencyToDecimal('12345')).toBe('123.45')
  })

  it('should parse single digit', () => {
    expect(parseCurrencyToDecimal('5')).toBe('0.05')
  })
})

describe('formatCurrency', () => {
  it('should format decimal string as BRL', () => {
    expect(formatCurrency('123.45')).toBe('R$\u00a0123,45')
  })

  it('should format large values', () => {
    expect(formatCurrency('1234.56')).toBe('R$\u00a01.234,56')
  })
})
