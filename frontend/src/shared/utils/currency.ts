/**
 * Format a raw digit string (cents) into BRL currency display.
 * Input: "12345" → Output: "R$ 123,45"
 * Input: "" → Output: "R$ 0,00"
 */
export function formatCurrencyInput(digits: string): string {
  const cleaned = digits.replace(/\D/g, '')
  const cents = parseInt(cleaned || '0', 10)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

/**
 * Parse a raw digit string (cents) into a decimal string for the API.
 * Input: "12345" → Output: "123.45"
 * Input: "" → Output: "0.00"
 */
export function parseCurrencyToDecimal(digits: string): string {
  const cleaned = digits.replace(/\D/g, '')
  const cents = parseInt(cleaned || '0', 10)
  return (cents / 100).toFixed(2)
}

/**
 * Format a decimal string into BRL currency display.
 * Input: "123.45" → Output: "R$ 123,45"
 */
export function formatCurrency(amount: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(parseFloat(amount))
}
