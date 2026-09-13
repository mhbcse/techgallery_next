import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CartPage from './CartPage'
import { useCartStore } from '@/stores/cartStore'

beforeEach(() => {
  useCartStore.setState({
    items: [
      {
        productId: '1',
        variantId: '10',
        contentId: 'product-10-web-1',
        name: 'Aero-Glide Pro',
        variantName: 'Black',
        price: 100,
        quantity: 2,
        imageUrl: null,
      },
    ],
  })
})

describe('CartPage', () => {
  it('renders cart items and the live subtotal', () => {
    render(<CartPage />)
    expect(screen.getByText('Aero-Glide Pro')).toBeInTheDocument()
    // subtotal = 100 * 2
    expect(screen.getAllByText(/৳\s?200/).length).toBeGreaterThan(0)
  })

  it('does not promise a delivery charge it cannot know', () => {
    render(<CartPage />)
    expect(screen.getByText(/Calculated at checkout/i)).toBeInTheDocument()
  })

  it('sends the shopper to checkout rather than collecting details here', () => {
    render(<CartPage />)
    expect(screen.getByRole('link', { name: /Proceed To Checkout/i })).toHaveAttribute('href', '/checkout')
    expect(screen.queryByPlaceholderText('Full Name')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Promo code')).not.toBeInTheDocument()
  })

  it('updates a line quantity', async () => {
    const user = userEvent.setup()
    render(<CartPage />)

    await user.click(screen.getByRole('button', { name: '+' }))

    expect(useCartStore.getState().items[0].quantity).toBe(3)
  })

  it('removes a line', async () => {
    const user = userEvent.setup()
    render(<CartPage />)

    await user.click(screen.getByRole('button', { name: 'delete' }))

    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('clears the cart', async () => {
    const user = userEvent.setup()
    render(<CartPage />)

    await user.click(screen.getByRole('button', { name: /Clear/i }))

    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('shows the empty state with no items', () => {
    useCartStore.setState({ items: [] })
    render(<CartPage />)

    expect(screen.getByText(/Your loadout is empty/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Proceed To Checkout/i })).not.toBeInTheDocument()
  })
})
