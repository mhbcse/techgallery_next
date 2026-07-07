import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CartPage from './CartPage'
import { useCartStore } from '@/stores/cartStore'
import { createOrder } from '@/api/orders'
import { listDistricts, listAreas } from '@/api/locations'
import { trackInitiateCheckout } from '@/lib/pixel'

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }))
vi.mock('@/api/orders', () => ({ createOrder: vi.fn() }))
vi.mock('@/api/locations', () => ({ listDistricts: vi.fn(), listAreas: vi.fn() }))
vi.mock('@/api/incompleteOrders', () => ({ captureIncompleteOrder: vi.fn() }))
vi.mock('@/lib/tracking', () => ({ getStoredTracking: () => ({}) }))
vi.mock('@/lib/pixel', () => ({ trackInitiateCheckout: vi.fn() }))
vi.mock('react-hot-toast', () => {
  const fn = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() })
  return { default: fn }
})

beforeEach(() => {
  vi.clearAllMocks()
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
  vi.mocked(listDistricts).mockResolvedValue([{ id: 1, name: 'Dhaka', bn_name: '', fee: 60 }])
  vi.mocked(listAreas).mockResolvedValue([{ id: 10, name: 'Banasree', bn_name: '', fee: 80 }])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(createOrder).mockResolvedValue({ grand_total: 280 } as any)
})

describe('CartPage checkout flow', () => {
  it('renders cart items and the live subtotal', () => {
    render(<CartPage />)
    expect(screen.getByText('Aero-Glide Pro')).toBeInTheDocument()
    // subtotal = 100 * 2
    expect(screen.getAllByText(/৳\s?200/).length).toBeGreaterThan(0)
  })

  it('fires InitiateCheckout on the first field input, not on cart view, and only once', async () => {
    const user = userEvent.setup()
    render(<CartPage />)
    await screen.findByRole('option', { name: 'Dhaka' })

    // Viewing the cart (mount + hydration) must not signal checkout.
    expect(trackInitiateCheckout).not.toHaveBeenCalled()

    await user.type(screen.getByPlaceholderText('Full Name'), 'A')
    expect(trackInitiateCheckout).toHaveBeenCalledTimes(1)

    // Further edits in the same mount do not re-fire (per-mount short-circuit).
    await user.type(screen.getByPlaceholderText(/Mobile Number/), '01712345678')
    expect(trackInitiateCheckout).toHaveBeenCalledTimes(1)
  })

  it('blocks order placement until district and area are selected', async () => {
    const user = userEvent.setup()
    render(<CartPage />)
    await screen.findByRole('option', { name: 'Dhaka' })

    await user.type(screen.getByPlaceholderText('Full Name'), 'Test User')
    await user.type(screen.getByPlaceholderText(/Mobile Number/), '01712345678')
    await user.type(screen.getByPlaceholderText(/House no/), '123 Street, Dhaka')

    await user.click(screen.getByRole('button', { name: /Confirm Order/i }))

    await screen.findByText(/District and area are required/i)
    expect(createOrder).not.toHaveBeenCalled()
  })

  it('places an order with mapped items + resolved shipping, then clears the cart', async () => {
    const user = userEvent.setup()
    render(<CartPage />)
    await screen.findByRole('option', { name: 'Dhaka' })

    await user.type(screen.getByPlaceholderText('Full Name'), 'Test User')
    await user.type(screen.getByPlaceholderText(/Mobile Number/), '01712345678')
    await user.type(screen.getByPlaceholderText(/House no/), '123 Street, Dhaka')

    await user.selectOptions(screen.getByDisplayValue('Select District *'), '1')
    await screen.findByRole('option', { name: 'Banasree' })
    await user.selectOptions(screen.getByDisplayValue('Select Area *'), '10')

    await user.click(screen.getByRole('button', { name: /Confirm Order/i }))

    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1))

    const payload = vi.mocked(createOrder).mock.calls[0][0]
    expect(payload.order_items).toEqual([{ variant_id: 10, quantity: 2 }])
    expect(payload.shipping_charge).toBe(80) // area fee overrides district fee
    expect(payload.order).toMatchObject({
      customer_name: 'Test User',
      customer_phone: '01712345678',
      customer_address: '123 Street, Dhaka',
      customer_district: 'Dhaka',
      customer_area: 'Banasree',
    })
    // reCAPTCHA is intentionally not used
    expect(JSON.stringify(payload)).not.toContain('recaptcha')

    await waitFor(() => expect(useCartStore.getState().items).toHaveLength(0))
    expect(pushMock).toHaveBeenCalledWith('/')
  })
})
