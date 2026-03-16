import React, { useActionState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('@/lib/actions/auth', () => ({
  loginAction: jest.fn(),
  registerAction: jest.fn(),
}))

const mockDispatch = jest.fn()
jest.mock('react', () => {
  const actual = jest.requireActual('react')
  return {
    ...actual,
    useActionState: jest.fn(),
  }
})

import { SignupForm } from '@/components/auth/signup-form'

const mockUseActionState = jest.mocked(useActionState)

function setupState(overrides: Partial<{ error: string; fieldErrors: Record<string, string[]> }> = {}) {
  mockUseActionState.mockReturnValue([overrides, mockDispatch, false])
}

beforeEach(() => {
  jest.clearAllMocks()
  setupState()
})

describe('SignupForm', () => {
  it('renders all four input fields', () => {
    render(<SignupForm />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('renders the create account button', () => {
    render(<SignupForm />)
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument()
  })

  it('renders a link back to the login page', () => {
    render(<SignupForm />)
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/login'
    )
  })

  it('shows a global error message from state', () => {
    setupState({ error: 'Account created but sign-in failed. Please log in.' })
    render(<SignupForm />)
    expect(
      screen.getByText('Account created but sign-in failed. Please log in.')
    ).toBeInTheDocument()
  })

  it('shows name field error from state', () => {
    setupState({ fieldErrors: { name: ['Name must be at least 2 characters'] } })
    render(<SignupForm />)
    expect(
      screen.getByText('Name must be at least 2 characters')
    ).toBeInTheDocument()
  })

  it('shows email field error from state', () => {
    setupState({
      fieldErrors: { email: ['An account with this email already exists.'] },
    })
    render(<SignupForm />)
    expect(
      screen.getByText('An account with this email already exists.')
    ).toBeInTheDocument()
  })

  it('shows password field error from state', () => {
    setupState({
      fieldErrors: { password: ['Password must be at least 8 characters'] },
    })
    render(<SignupForm />)
    expect(
      screen.getByText('Password must be at least 8 characters')
    ).toBeInTheDocument()
  })

  it('shows confirmPassword field error from state', () => {
    setupState({ fieldErrors: { confirmPassword: ['Passwords do not match'] } })
    render(<SignupForm />)
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })

  it('shows "Creating account..." and disables the button while pending', () => {
    mockUseActionState.mockReturnValue([{}, mockDispatch, true])
    render(<SignupForm />)
    const btn = screen.getByRole('button', { name: /creating account/i })
    expect(btn).toBeDisabled()
  })

  it('updates name field value on change', async () => {
    render(<SignupForm />)
    const nameInput = screen.getByLabelText(/full name/i)
    await userEvent.type(nameInput, 'Jane Doe')
    expect(nameInput).toHaveValue('Jane Doe')
  })
})
