import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import OrderConfirmationPage from './OrderConfirmationPage'
import { useAuthStore } from '@/stores/authStore'

const { searchParams } = vi.hoisted(() => ({ searchParams: new URLSearchParams() }))

vi.mock('next/navigation', () => ({ useSearchParams: () => searchParams }))

beforeEach(() => {
  searchParams.set('submission', 'sub_123')
  useAuthStore.setState({ user: null })
})

describe('OrderConfirmationPage', () => {
  it('confirms the order without promising a number it cannot have', () => {
    render(<OrderConfirmationPage />)

    expect(screen.getByText(/Order Received/i)).toBeInTheDocument()
    // The API returns a submission id, not an order number — never show one.
    expect(screen.queryByText('sub_123')).not.toBeInTheDocument()
  })

  it('invites a guest to create an account', () => {
    render(<OrderConfirmationPage />)

    expect(screen.getByRole('link', { name: /Create Account/i })).toHaveAttribute('href', '/register')
    expect(screen.queryByRole('link', { name: /My Orders/i })).not.toBeInTheDocument()
  })

  it('sends a signed-in customer to their order history', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useAuthStore.setState({ user: { id: 1, name: 'Rafi' } as any })
    render(<OrderConfirmationPage />)

    expect(screen.getByRole('link', { name: /My Orders/i })).toHaveAttribute('href', '/account/orders')
    expect(screen.queryByRole('link', { name: /Create Account/i })).not.toBeInTheDocument()
  })

  it('degrades to an empty state without a submission id', () => {
    searchParams.delete('submission')
    render(<OrderConfirmationPage />)

    expect(screen.getByText(/Nothing to confirm here/i)).toBeInTheDocument()
  })
})
