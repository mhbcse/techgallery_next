import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterPage from './RegisterPage'
import { saveCheckoutDetails } from '@/lib/checkoutDetails'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('react-hot-toast', () => ({
  default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}))

beforeEach(() => {
  window.localStorage.clear()
})

describe('RegisterPage', () => {
  it('prefills name and phone from the stored checkout details', async () => {
    saveCheckoutDetails({ name: 'Rafi Ahmed', phone: '01712345678' })
    render(<RegisterPage />)

    await waitFor(() => expect(screen.getByPlaceholderText('John Doe')).toHaveValue('Rafi Ahmed'))
    expect(screen.getByPlaceholderText('1XXXXXXXXX')).toHaveValue('01712345678')
    // Checkout never asks for an email, and credentials are never carried over.
    expect(screen.getByPlaceholderText('name@example.com')).toHaveValue('')
    expect(screen.getAllByPlaceholderText('••••••••')[0]).toHaveValue('')
  })

  it('does not overwrite what the shopper has already typed', async () => {
    saveCheckoutDetails({ name: 'Rafi Ahmed', phone: '01712345678' })
    const user = userEvent.setup()
    render(<RegisterPage />)

    await waitFor(() => expect(screen.getByPlaceholderText('John Doe')).toHaveValue('Rafi Ahmed'))
    await user.clear(screen.getByPlaceholderText('John Doe'))
    await user.type(screen.getByPlaceholderText('John Doe'), 'Someone Else')

    expect(screen.getByPlaceholderText('John Doe')).toHaveValue('Someone Else')
  })

  it('leaves the form empty when checkout stored nothing', async () => {
    render(<RegisterPage />)

    await waitFor(() => expect(screen.getByPlaceholderText('John Doe')).toHaveValue(''))
    expect(screen.getByPlaceholderText('1XXXXXXXXX')).toHaveValue('')
  })
})
