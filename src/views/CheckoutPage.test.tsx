import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CheckoutPage from './CheckoutPage'
import { useCartStore } from '@/stores/cartStore'
import { createOrder } from '@/api/orders'
import { validateCoupon } from '@/api/coupons'
import { listDistricts, listAreas } from '@/api/locations'
import { captureIncompleteOrder } from '@/api/incompleteOrders'
import { trackInitiateCheckout } from '@/lib/pixel'

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }))
vi.mock('@/api/orders', () => ({ createOrder: vi.fn() }))
vi.mock('@/api/coupons', () => ({ validateCoupon: vi.fn() }))
vi.mock('@/api/locations', () => ({ listDistricts: vi.fn(), listAreas: vi.fn() }))
vi.mock('@/api/incompleteOrders', () => ({ captureIncompleteOrder: vi.fn() }))
vi.mock('@/lib/tracking', () => ({ getStoredTracking: () => ({}) }))
vi.mock('@/lib/pixel', () => ({ trackInitiateCheckout: vi.fn() }))
vi.mock('react-hot-toast', () => {
  const fn = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() })
  return { default: fn }
})

const fillShipping = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByPlaceholderText('Full Name'), 'Test User')
  await user.type(screen.getByPlaceholderText(/Mobile Number/), '01712345678')
  await user.type(screen.getByPlaceholderText(/House no/), '123 Street, Dhaka')
}

const placeOrder = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getAllByRole('button', { name: /Place Order/i })[0])

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
  vi.mocked(createOrder).mockResolvedValue({ submission_id: 'sub_123', status: 'queued' })
  vi.mocked(validateCoupon).mockResolvedValue({
    valid: true,
    code: 'TG50',
    discount_amount: 50,
    shipping_discount_amount: 0,
  })
  window.localStorage.clear()
})

describe('CheckoutPage', () => {
  it('lists the cart lines it is about to order', async () => {
    render(<CheckoutPage />)
    await screen.findByRole('option', { name: 'Dhaka' })

    expect(screen.getByText('Aero-Glide Pro')).toBeInTheDocument()
    expect(screen.getAllByText(/৳\s?200/).length).toBeGreaterThan(0)
  })

  it('signals InitiateCheckout on arriving at checkout, once', async () => {
    const user = userEvent.setup()
    render(<CheckoutPage />)
    await screen.findByRole('option', { name: 'Dhaka' })

    expect(trackInitiateCheckout).toHaveBeenCalledTimes(1)
    expect(vi.mocked(trackInitiateCheckout).mock.calls[0][0]).toEqual({
      contentIds: ['product-10-web-1'],
      value: 200,
      numItems: 2,
    })

    await user.type(screen.getByPlaceholderText('Full Name'), 'A')
    expect(trackInitiateCheckout).toHaveBeenCalledTimes(1)
  })

  it('does not signal InitiateCheckout with an empty cart', async () => {
    useCartStore.setState({ items: [] })
    render(<CheckoutPage />)
    await waitFor(() => expect(listDistricts).toHaveBeenCalled())

    expect(trackInitiateCheckout).not.toHaveBeenCalled()
  })

  it('blocks order placement until a district is selected', async () => {
    const user = userEvent.setup()
    render(<CheckoutPage />)
    await screen.findByRole('option', { name: 'Dhaka' })

    await fillShipping(user)
    await placeOrder(user)

    await screen.findByText(/District is required/i)
    expect(createOrder).not.toHaveBeenCalled()
  })

  it('places an order with mapped items + resolved shipping, then clears the cart', async () => {
    const user = userEvent.setup()
    render(<CheckoutPage />)
    await screen.findByRole('option', { name: 'Dhaka' })

    await fillShipping(user)
    await user.selectOptions(screen.getByDisplayValue('Select District *'), '1')
    await screen.findByRole('option', { name: 'Banasree' })
    await user.selectOptions(screen.getByDisplayValue('Select Area (optional)'), '10')

    await placeOrder(user)

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
    expect(pushMock).toHaveBeenCalledWith('/checkout/confirmation?submission=sub_123')
  })

  it('places an order without an area, falling back to the district fee', async () => {
    const user = userEvent.setup()
    render(<CheckoutPage />)
    await screen.findByRole('option', { name: 'Dhaka' })

    await fillShipping(user)
    await user.selectOptions(screen.getByDisplayValue('Select District *'), '1')

    await placeOrder(user)

    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1))
    const payload = vi.mocked(createOrder).mock.calls[0][0]
    expect(payload.shipping_charge).toBe(60)
    expect(payload.order).toMatchObject({ customer_district: 'Dhaka' })
    expect(payload.order.customer_area).toBeUndefined()
  })

  it('does not flash the empty-cart state while the confirmation page loads', async () => {
    const user = userEvent.setup()
    render(<CheckoutPage />)
    await screen.findByRole('option', { name: 'Dhaka' })

    await fillShipping(user)
    await user.selectOptions(screen.getByDisplayValue('Select District *'), '1')
    await placeOrder(user)

    await waitFor(() => expect(pushMock).toHaveBeenCalled())
    expect(useCartStore.getState().items).toHaveLength(0)
    expect(screen.queryByText(/Your loadout is empty/i)).not.toBeInTheDocument()
  })

  it('keeps the cart and stays put when the order fails', async () => {
    vi.mocked(createOrder).mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    render(<CheckoutPage />)
    await screen.findByRole('option', { name: 'Dhaka' })

    await fillShipping(user)
    await user.selectOptions(screen.getByDisplayValue('Select District *'), '1')
    await placeOrder(user)

    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1))
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('captures an incomplete order on phone blur, once per number', async () => {
    const user = userEvent.setup()
    render(<CheckoutPage />)
    await screen.findByRole('option', { name: 'Dhaka' })

    await user.type(screen.getByPlaceholderText(/Mobile Number/), '01712345678')
    await user.tab()
    expect(captureIncompleteOrder).toHaveBeenCalledTimes(1)

    await user.click(screen.getByPlaceholderText(/Mobile Number/))
    await user.tab()
    expect(captureIncompleteOrder).toHaveBeenCalledTimes(1)
  })

  it('does not capture an incomplete order for a too-short phone', async () => {
    const user = userEvent.setup()
    render(<CheckoutPage />)
    await screen.findByRole('option', { name: 'Dhaka' })

    await user.type(screen.getByPlaceholderText(/Mobile Number/), '0171')
    await user.tab()

    expect(captureIncompleteOrder).not.toHaveBeenCalled()
  })

  describe('promo codes', () => {
    const applyCode = async (user: ReturnType<typeof userEvent.setup>, code = 'TG50') => {
      await user.type(screen.getByLabelText('Promo code'), code)
      await user.click(screen.getByRole('button', { name: /^Apply$/i }))
    }

    it('does not quote on mount or while the code is being typed', async () => {
      const user = userEvent.setup()
      render(<CheckoutPage />)

      await user.type(screen.getByLabelText('Promo code'), 'TG50')
      expect(validateCoupon).not.toHaveBeenCalled()
    })

    it('applies a valid code and deducts it from the total', async () => {
      const user = userEvent.setup()
      render(<CheckoutPage />)

      await applyCode(user)

      expect(await screen.findByText('Discount (TG50)')).toBeInTheDocument()
      // subtotal 200 - 50, shipping not yet known
      expect(screen.getAllByText(/৳\s?150/).length).toBeGreaterThan(0)
    })

    it('never lets an oversized discount push the total below zero', async () => {
      vi.mocked(validateCoupon).mockResolvedValue({
        valid: true,
        code: 'HUGE',
        discount_amount: 99999,
        shipping_discount_amount: 0,
      })
      const user = userEvent.setup()
      render(<CheckoutPage />)

      await applyCode(user, 'HUGE')

      expect(await screen.findByText('−৳200')).toBeInTheDocument()
    })

    it('sends the raw code on the order, never the quoted amount', async () => {
      const user = userEvent.setup()
      render(<CheckoutPage />)

      await screen.findByRole('option', { name: 'Dhaka' })
      await fillShipping(user)
      await user.selectOptions(screen.getByDisplayValue('Select District *'), '1')
      await applyCode(user)
      await screen.findByText('Discount (TG50)')

      await placeOrder(user)

      await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1))
      const payload = vi.mocked(createOrder).mock.calls[0][0]
      expect(payload.coupon_code).toBe('TG50')
      expect(payload).not.toHaveProperty('discount_amount')
    })

    it('sends no coupon_code when none is applied', async () => {
      const user = userEvent.setup()
      render(<CheckoutPage />)
      await screen.findByRole('option', { name: 'Dhaka' })

      await fillShipping(user)
      await user.selectOptions(screen.getByDisplayValue('Select District *'), '1')
      await placeOrder(user)

      await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1))
      expect(vi.mocked(createOrder).mock.calls[0][0].coupon_code).toBeUndefined()
    })

    it('shows the refusal reason verbatim and restores the full total', async () => {
      vi.mocked(validateCoupon).mockResolvedValue({ valid: false, reason: 'This coupon has expired' })
      const user = userEvent.setup()
      render(<CheckoutPage />)

      await applyCode(user)

      expect(await screen.findByText('This coupon has expired')).toBeInTheDocument()
      expect(screen.queryByText(/^Discount \(/)).not.toBeInTheDocument()
    })

    it('says a code could not be checked rather than calling it invalid', async () => {
      vi.mocked(validateCoupon).mockRejectedValue(new Error('503'))
      const user = userEvent.setup()
      render(<CheckoutPage />)

      await applyCode(user)

      expect(await screen.findByText(/could not check that code/i)).toBeInTheDocument()
      expect(screen.queryByText(/invalid|expired/i)).not.toBeInTheDocument()
    })

    it('does not place the order while a quote is in flight', async () => {
      vi.mocked(validateCoupon).mockImplementation(() => new Promise(() => {}))
      const user = userEvent.setup()
      render(<CheckoutPage />)
      await screen.findByRole('option', { name: 'Dhaka' })

      await fillShipping(user)
      await user.selectOptions(screen.getByDisplayValue('Select District *'), '1')
      await applyCode(user)
      await placeOrder(user)

      expect(createOrder).not.toHaveBeenCalled()
    })

    it('does not place the order when Enter is pressed in the discount field', async () => {
      const user = userEvent.setup()
      render(<CheckoutPage />)
      await screen.findByRole('option', { name: 'Dhaka' })

      await fillShipping(user)
      await user.selectOptions(screen.getByDisplayValue('Select District *'), '1')
      await user.type(screen.getByLabelText('Promo code'), 'TG50{Enter}')

      await waitFor(() => expect(validateCoupon).toHaveBeenCalledTimes(1))
      expect(createOrder).not.toHaveBeenCalled()
    })

    it('keeps a held code when a later check cannot reach the API', async () => {
      const user = userEvent.setup()
      const first = render(<CheckoutPage />)

      await applyCode(user)
      await screen.findByText('Discount (TG50)')
      first.unmount()

      vi.mocked(validateCoupon).mockRejectedValue(new Error('503'))
      render(<CheckoutPage />)

      expect(await screen.findByText(/could not check that code/i)).toBeInTheDocument()
      // Unreachable is not a refusal — the hold survives for the next visit.
      expect(window.localStorage.getItem('tg_coupon')).not.toBeNull()
    })

    it('re-applies a held code on the next visit and releases it on order', async () => {
      const user = userEvent.setup()
      const first = render(<CheckoutPage />)

      await applyCode(user)
      await screen.findByText('Discount (TG50)')
      first.unmount()

      vi.mocked(validateCoupon).mockClear()
      render(<CheckoutPage />)

      await waitFor(() => expect(validateCoupon).toHaveBeenCalledTimes(1))
      expect(vi.mocked(validateCoupon).mock.calls[0][0].code).toBe('TG50')
      expect(await screen.findByText('Discount (TG50)')).toBeInTheDocument()

      await screen.findByRole('option', { name: 'Dhaka' })
      await fillShipping(user)
      await user.selectOptions(screen.getByDisplayValue('Select District *'), '1')
      await placeOrder(user)

      await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1))
      expect(window.localStorage.getItem('tg_coupon')).toBeNull()
    })

    it('drops an expired hold without quoting it', async () => {
      window.localStorage.setItem(
        'tg_coupon',
        JSON.stringify({ code: 'TG50', expiresAt: Date.now() - 1000 })
      )
      render(<CheckoutPage />)

      expect(await screen.findByLabelText('Promo code')).toBeInTheDocument()
      expect(validateCoupon).not.toHaveBeenCalled()
      expect(window.localStorage.getItem('tg_coupon')).toBeNull()
    })

    it('releases the hold when the code is removed', async () => {
      const user = userEvent.setup()
      render(<CheckoutPage />)

      await applyCode(user)
      await screen.findByText('Discount (TG50)')

      await user.click(screen.getByRole('button', { name: /Remove/i }))

      expect(window.localStorage.getItem('tg_coupon')).toBeNull()
      expect(screen.queryByText('Discount (TG50)')).not.toBeInTheDocument()
    })
  })

  it('does not ask for an email or a password', async () => {
    render(<CheckoutPage />)
    await screen.findByRole('option', { name: 'Dhaka' })

    expect(screen.queryByPlaceholderText(/Email/i)).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/password/i)).not.toBeInTheDocument()
  })

  it('offers no online payment method — cash on delivery only', async () => {
    render(<CheckoutPage />)
    await screen.findByRole('option', { name: 'Dhaka' })

    expect(screen.getByText(/Cash on Delivery/i)).toBeInTheDocument()
    expect(screen.queryByText(/bkash|nagad|card/i)).not.toBeInTheDocument()
  })
})
