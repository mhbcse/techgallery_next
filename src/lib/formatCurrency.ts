import { CURRENCY_SYMBOL } from './constants'

export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return `${CURRENCY_SYMBOL}0`
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return `${CURRENCY_SYMBOL}0`
  return `${CURRENCY_SYMBOL}${Math.round(num).toLocaleString('en-IN')}`
}

// A product's price span: one figure when every variant costs the same, both ends when they
// don't — so a card never quotes the cheapest variant as if it were the price.
export function formatPriceRange(
  min: string | number | null | undefined,
  max?: string | number | null
): string {
  if (max === null || max === undefined || Number(max) === Number(min)) return formatCurrency(min)
  return `${formatCurrency(min)} – ${formatCurrency(max)}`
}
