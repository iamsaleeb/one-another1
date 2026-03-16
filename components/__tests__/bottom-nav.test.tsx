import { render, screen } from '@testing-library/react'
import { BottomNav } from '@/components/bottom-nav'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

import { usePathname } from 'next/navigation'

const mockUsePathname = usePathname as jest.Mock

describe('BottomNav', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  it('renders all three navigation tabs', () => {
    render(<BottomNav />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Churches')).toBeInTheDocument()
    expect(screen.getByText('My Events')).toBeInTheDocument()
  })

  it('renders nav links with correct hrefs', () => {
    render(<BottomNav />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('/')
    expect(hrefs).toContain('/churches')
    expect(hrefs).toContain('/my-events')
  })

  it('returns null on an event detail page', () => {
    mockUsePathname.mockReturnValue('/events/evt-123')
    const { container } = render(<BottomNav />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null on a church detail page', () => {
    mockUsePathname.mockReturnValue('/churches/ch-456')
    const { container } = render(<BottomNav />)
    expect(container.firstChild).toBeNull()
  })

  it('renders on the churches listing page', () => {
    mockUsePathname.mockReturnValue('/churches')
    render(<BottomNav />)
    expect(screen.getByText('Churches')).toBeInTheDocument()
  })

  it('renders on the my-events page', () => {
    mockUsePathname.mockReturnValue('/my-events')
    render(<BottomNav />)
    expect(screen.getByText('My Events')).toBeInTheDocument()
  })
})
