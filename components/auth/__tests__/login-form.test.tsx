import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock server action before importing the component
jest.mock('@/lib/actions/auth', () => ({
  loginAction: jest.fn(),
  registerAction: jest.fn(),
}))

// Mock useActionState so we control the returned state
const mockDispatch = jest.fn()
jest.mock('react', () => {
  const actual = jest.requireActual('react')
  return {
    ...actual,
    useActionState: jest.fn(),
  }
})

import { LoginForm } from '@/components/auth/login-form'

const mockUseActionState = (
  require('react') as { useActionState: jest.Mock }
).useActionState

function setupState(overrides: Partial<{ error: string; fieldErrors: Record<string, string[]> }> = {}) {
  mockUseActionState.mockReturnValue([overrides, mockDispatch, false])
}

beforeEach(() => {
  jest.clearAllMocks()
  setupState()
})

describe('LoginForm', () => {
  it('renders email and password inputs', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders the login button', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('renders a link to the register page', () => {
    render(<LoginForm />)
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute(
      'href',
      '/register'
    )
  })

  it('shows a global error message from state', () => {
    setupState({ error: 'Invalid email or password.' })
    render(<LoginForm />)
    expect(screen.getByText('Invalid email or password.')).toBeInTheDocument()
  })

  it('shows email field error from state', () => {
    setupState({ fieldErrors: { email: ['Invalid email address'] } })
    render(<LoginForm />)
    expect(screen.getByText('Invalid email address')).toBeInTheDocument()
  })

  it('shows password field error from state', () => {
    setupState({ fieldErrors: { password: ['Password is required'] } })
    render(<LoginForm />)
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('shows "Signing in..." and disables the button while pending', () => {
    mockUseActionState.mockReturnValue([{}, mockDispatch, true])
    render(<LoginForm />)
    const btn = screen.getByRole('button', { name: /signing in/i })
    expect(btn).toBeDisabled()
  })

  it('updates email input value on change', async () => {
    render(<LoginForm />)
    const emailInput = screen.getByLabelText(/email/i)
    await userEvent.type(emailInput, 'test@example.com')
    expect(emailInput).toHaveValue('test@example.com')
  })
})
