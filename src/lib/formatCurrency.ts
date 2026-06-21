import { CURRENCY_SYMBOL } from './constants'

export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return `${CURRENCY_SYMBOL}0`
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return `${CURRENCY_SYMBOL}0`
  return `${CURRENCY_SYMBOL}${Math.round(num).toLocaleString('en-IN')}`
}
