import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  useParams: jest.fn(),
}))

import {
  usePathname,
  useRouter,
  useSearchParams,
  useParams,
} from 'next/navigation'
import { TopNav } from '@/components/top-nav'

const mockPush = jest.fn()

function setupNavMocks({
  pathname = '/',
  q = '',
  params = {},
}: {
  pathname?: string
  q?: string
  params?: Record<string, string>
} = {}) {
  ;(usePathname as jest.Mock).mockReturnValue(pathname)
  ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  ;(useSearchParams as jest.Mock).mockReturnValue({
    get: (key: string) => (key === 'q' ? q || null : null),
  })
  ;(useParams as jest.Mock).mockReturnValue(params)
}

beforeEach(() => {
  jest.clearAllMocks()
  setupNavMocks()
})

describe('TopNav — home page', () => {
  it('renders the app brand link', () => {
    render(<TopNav />)
    expect(screen.getByText('1Another')).toBeInTheDocument()
  })

  it('renders the search input', () => {
    render(<TopNav />)
    expect(
      screen.getByPlaceholderText(/search events/i)
    ).toBeInTheDocument()
  })

  it('renders a link to the profile page', () => {
    render(<TopNav />)
    const links = screen.getAllByRole('link')
    const profileLink = links.find((l) => l.getAttribute('href') === '/profile')
    expect(profileLink).toBeInTheDocument()
  })

  it('pre-fills search input from URL query param', () => {
    setupNavMocks({ q: 'worship' })
    render(<TopNav />)
    expect(screen.getByDisplayValue('worship')).toBeInTheDocument()
  })

  it('shows an extra clear (X) button when search input has a value', () => {
    setupNavMocks({ q: 'hello' })
    render(<TopNav />)
    // Without a query there is 1 button (submit). With a query the X clear button is also rendered.
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })

  it('navigates on search form submit', async () => {
    render(<TopNav />)
    const input = screen.getByPlaceholderText(/search events/i)
    await userEvent.type(input, 'grace')
    // Find and click the search submit button
    const buttons = screen.getAllByRole('button')
    const submitBtn = buttons[buttons.length - 1]
    await userEvent.click(submitBtn)
    expect(mockPush).toHaveBeenCalledWith('/?q=grace')
  })

  it('navigates to / on empty search submit', async () => {
    render(<TopNav />)
    const buttons = screen.getAllByRole('button')
    const submitBtn = buttons[buttons.length - 1]
    await userEvent.click(submitBtn)
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})

describe('TopNav — event detail page', () => {
  it('shows back button instead of brand link', () => {
    setupNavMocks({ pathname: '/events/evt-1', params: { id: 'evt-1' } })
    render(<TopNav />)
    expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument()
    expect(screen.queryByText('1Another')).not.toBeInTheDocument()
  })

  it('hides the search bar on detail pages', () => {
    setupNavMocks({ pathname: '/events/evt-1', params: { id: 'evt-1' } })
    render(<TopNav />)
    expect(
      screen.queryByPlaceholderText(/search events/i)
    ).not.toBeInTheDocument()
  })

  it('navigates to / when the back button is clicked on an event detail', async () => {
    setupNavMocks({ pathname: '/events/evt-1', params: { id: 'evt-1' } })
    render(<TopNav />)
    await userEvent.click(screen.getByRole('button', { name: /back to home/i }))
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})

describe('TopNav — church detail page', () => {
  it('shows back button on church detail page', () => {
    setupNavMocks({ pathname: '/churches/ch-1', params: { id: 'ch-1' } })
    render(<TopNav />)
    expect(screen.getByRole('button', { name: /back to churches/i })).toBeInTheDocument()
  })

  it('navigates to /churches when back button is clicked', async () => {
    setupNavMocks({ pathname: '/churches/ch-1', params: { id: 'ch-1' } })
    render(<TopNav />)
    await userEvent.click(screen.getByRole('button', { name: /back to churches/i }))
    expect(mockPush).toHaveBeenCalledWith('/churches')
  })
})

describe('TopNav — user avatar initials (getInitials)', () => {
  it('shows two initials from a full name', () => {
    render(<TopNav user={{ name: 'Jane Doe' }} />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('shows first two characters for a single-word name', () => {
    render(<TopNav user={{ name: 'Jane' }} />)
    expect(screen.getByText('JA')).toBeInTheDocument()
  })

  it('falls back to email initial when name is absent', () => {
    render(<TopNav user={{ email: 'test@example.com' }} />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('shows "?" when no user info is available', () => {
    render(<TopNav />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })
})
