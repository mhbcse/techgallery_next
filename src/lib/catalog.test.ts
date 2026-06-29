import { describe, expect, it } from 'vitest'
import { mergeCatalog } from './catalog'
import type { Bundle, Product } from '@/api/types'

const product = (id: string): Product =>
  ({ id, name: `P${id}` } as Product)
const bundle = (id: string): Bundle =>
  ({ id, name: `B${id}`, variants: [] } as unknown as Bundle)

const shape = (entries: ReturnType<typeof mergeCatalog>) =>
  entries.map((e) => (e.kind === 'product' ? `p${e.product.id}` : `b${e.bundle.id}`))

describe('mergeCatalog', () => {
  it('inserts a bundle after every `gap` products', () => {
    const result = mergeCatalog(
      [product('1'), product('2'), product('3'), product('4')],
      [bundle('9')],
      2
    )
    expect(shape(result)).toEqual(['p1', 'p2', 'b9', 'p3', 'p4'])
  })

  it('appends leftover bundles when products run out', () => {
    const result = mergeCatalog([product('1')], [bundle('8'), bundle('9')], 3)
    expect(shape(result)).toEqual(['p1', 'b8', 'b9'])
  })

  it('returns products only when there are no bundles', () => {
    const result = mergeCatalog([product('1'), product('2')], [])
    expect(shape(result)).toEqual(['p1', 'p2'])
  })

  it('returns bundles only when there are no products', () => {
    const result = mergeCatalog([], [bundle('8'), bundle('9')])
    expect(shape(result)).toEqual(['b8', 'b9'])
  })
})
