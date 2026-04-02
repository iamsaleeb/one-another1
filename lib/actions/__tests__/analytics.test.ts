jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: (...args: unknown[]) => unknown) => fn,
}))

jest.mock('@/lib/db', () => ({
  prisma: {
    eventView: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    eventAttendee: {
      findMany: jest.fn(),
    },
  },
}))

import { recordEventView, getEventAnalytics } from '@/lib/actions/analytics'
import { prisma } from '@/lib/db'

const mockEventViewFindFirst = prisma.eventView.findFirst as jest.Mock
const mockEventViewCreate = prisma.eventView.create as jest.Mock
const mockEventViewFindMany = prisma.eventView.findMany as jest.Mock
const mockEventAttendeeFindMany = prisma.eventAttendee.findMany as jest.Mock

/** Returns a Date for a person whose current age equals `years`. */
function dobForAge(years: number): Date {
  const d = new Date()
  d.setFullYear(d.getFullYear() - years)
  return d
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ---------------------------------------------------------------------------
// recordEventView
// ---------------------------------------------------------------------------
describe('recordEventView', () => {
  it('creates a view for an anonymous user without dedup check', async () => {
    mockEventViewCreate.mockResolvedValue({})

    await recordEventView('evt-1', null, 'search')

    expect(mockEventViewFindFirst).not.toHaveBeenCalled()
    expect(mockEventViewCreate).toHaveBeenCalledWith({
      data: { eventId: 'evt-1', userId: null, source: 'search' },
    })
  })

  it('creates a view for an authenticated user when no view exists today', async () => {
    mockEventViewFindFirst.mockResolvedValue(null)
    mockEventViewCreate.mockResolvedValue({})

    await recordEventView('evt-1', 'user-1', 'notification')

    expect(mockEventViewFindFirst).toHaveBeenCalledTimes(1)
    expect(mockEventViewCreate).toHaveBeenCalledWith({
      data: { eventId: 'evt-1', userId: 'user-1', source: 'notification' },
    })
  })

  it('skips creation for an authenticated user who already viewed today', async () => {
    mockEventViewFindFirst.mockResolvedValue({ id: 'view-existing' })

    await recordEventView('evt-1', 'user-1')

    expect(mockEventViewCreate).not.toHaveBeenCalled()
  })

  it('silently swallows errors so the page never breaks', async () => {
    mockEventViewCreate.mockRejectedValue(new Error('db error'))

    await expect(recordEventView('evt-1', null)).resolves.toBeUndefined()
  })

  it('defaults source to null when not provided', async () => {
    mockEventViewFindFirst.mockResolvedValue(null)
    mockEventViewCreate.mockResolvedValue({})

    await recordEventView('evt-1', 'user-2')

    expect(mockEventViewCreate).toHaveBeenCalledWith({
      data: { eventId: 'evt-1', userId: 'user-2', source: null },
    })
  })

  it('stores the provided source value', async () => {
    mockEventViewFindFirst.mockResolvedValue(null)
    mockEventViewCreate.mockResolvedValue({})

    await recordEventView('evt-1', 'user-3', 'direct')

    expect(mockEventViewCreate).toHaveBeenCalledWith({
      data: { eventId: 'evt-1', userId: 'user-3', source: 'direct' },
    })
  })
})

// ---------------------------------------------------------------------------
// getEventAnalytics
// ---------------------------------------------------------------------------
describe('getEventAnalytics', () => {
  it('returns all-zero analytics when there are no views or attendees', async () => {
    mockEventViewFindMany.mockResolvedValue([])
    mockEventAttendeeFindMany.mockResolvedValue([])

    const result = await getEventAnalytics('evt-1')

    expect(result.totalViews).toBe(0)
    expect(result.uniqueViews).toBe(0)
    expect(result.totalRegistrations).toBe(0)
    expect(result.conversionRate).toBe(0)
    expect(result.registrationsChart).toEqual([])
    expect(result.ageGroupsChart).toEqual([])
  })

  it('counts total and unique views correctly', async () => {
    mockEventViewFindMany.mockResolvedValue([
      { userId: 'user-1', viewedAt: new Date() },
      { userId: 'user-1', viewedAt: new Date() }, // duplicate — same user
      { userId: 'user-2', viewedAt: new Date() },
      { userId: null, viewedAt: new Date() },     // anonymous
    ])
    mockEventAttendeeFindMany.mockResolvedValue([])

    const result = await getEventAnalytics('evt-1')

    expect(result.totalViews).toBe(4)
    expect(result.uniqueViews).toBe(2) // user-1 and user-2; anonymous excluded
  })

  it('calculates conversion rate as registrations / total views * 100', async () => {
    mockEventViewFindMany.mockResolvedValue([
      { userId: 'user-1', viewedAt: new Date() },
      { userId: 'user-2', viewedAt: new Date() },
      { userId: null, viewedAt: new Date() },
      { userId: null, viewedAt: new Date() },
    ])
    mockEventAttendeeFindMany.mockResolvedValue([
      { createdAt: new Date('2026-03-01'), user: { dateOfBirth: null } },
    ])

    const result = await getEventAnalytics('evt-1')

    // 1 registration / 4 views = 25 %
    expect(result.conversionRate).toBe(25)
  })

  it('caps conversion rate at 100% when registrations exceed views', async () => {
    mockEventViewFindMany.mockResolvedValue([
      { userId: 'user-1', viewedAt: new Date() },
    ])
    mockEventAttendeeFindMany.mockResolvedValue([
      { createdAt: new Date('2026-03-01'), user: { dateOfBirth: null } },
      { createdAt: new Date('2026-03-01'), user: { dateOfBirth: null } },
    ])

    const result = await getEventAnalytics('evt-1')

    expect(result.conversionRate).toBe(100)
  })

  it('groups registrations by calendar day', async () => {
    mockEventViewFindMany.mockResolvedValue([])
    mockEventAttendeeFindMany.mockResolvedValue([
      { createdAt: new Date('2026-03-01T08:00:00Z'), user: { dateOfBirth: null } },
      { createdAt: new Date('2026-03-01T20:00:00Z'), user: { dateOfBirth: null } },
      { createdAt: new Date('2026-03-03T12:00:00Z'), user: { dateOfBirth: null } },
    ])

    const result = await getEventAnalytics('evt-1')

    expect(result.registrationsChart).toEqual([
      { date: '2026-03-01', registrations: 2 },
      { date: '2026-03-03', registrations: 1 },
    ])
  })

  it('returns registrations chart sorted by date ascending', async () => {
    mockEventViewFindMany.mockResolvedValue([])
    mockEventAttendeeFindMany.mockResolvedValue([
      { createdAt: new Date('2026-03-05T00:00:00Z'), user: { dateOfBirth: null } },
      { createdAt: new Date('2026-03-02T00:00:00Z'), user: { dateOfBirth: null } },
    ])

    const result = await getEventAnalytics('evt-1')

    expect(result.registrationsChart[0].date).toBe('2026-03-02')
    expect(result.registrationsChart[1].date).toBe('2026-03-05')
  })

  it('buckets attendees into the correct age groups', async () => {
    mockEventViewFindMany.mockResolvedValue([])
    mockEventAttendeeFindMany.mockResolvedValue([
      { createdAt: new Date(), user: { dateOfBirth: dobForAge(15) } },  // Under 18
      { createdAt: new Date(), user: { dateOfBirth: dobForAge(20) } },  // 18–25
      { createdAt: new Date(), user: { dateOfBirth: dobForAge(20) } },  // 18–25 (second)
      { createdAt: new Date(), user: { dateOfBirth: dobForAge(30) } },  // 26–35
      { createdAt: new Date(), user: { dateOfBirth: dobForAge(45) } },  // 36–50
      { createdAt: new Date(), user: { dateOfBirth: dobForAge(60) } },  // 51+
      { createdAt: new Date(), user: { dateOfBirth: null } },           // Unknown
    ])

    const result = await getEventAnalytics('evt-1')

    const toMap = (chart: { group: string; count: number }[]) =>
      Object.fromEntries(chart.map(({ group, count }) => [group, count]))

    const groups = toMap(result.ageGroupsChart)
    expect(groups['Under 18']).toBe(1)
    expect(groups['18\u201325']).toBe(2)
    expect(groups['26\u201335']).toBe(1)
    expect(groups['36\u201350']).toBe(1)
    expect(groups['51+']).toBe(1)
    expect(groups['Unknown']).toBe(1)
  })

  it('omits age groups with zero count from the chart', async () => {
    mockEventViewFindMany.mockResolvedValue([])
    mockEventAttendeeFindMany.mockResolvedValue([
      { createdAt: new Date(), user: { dateOfBirth: dobForAge(22) } }, // 18–25 only
    ])

    const result = await getEventAnalytics('evt-1')

    const groups = result.ageGroupsChart.map((d) => d.group)
    expect(groups).toContain('18\u201325')
    expect(groups).not.toContain('Under 18')
    expect(groups).not.toContain('51+')
    expect(groups).not.toContain('Unknown')
  })

  it('returns conversionRate 0 when there are no views', async () => {
    mockEventViewFindMany.mockResolvedValue([])
    mockEventAttendeeFindMany.mockResolvedValue([
      { createdAt: new Date(), user: { dateOfBirth: null } },
    ])

    const result = await getEventAnalytics('evt-1')

    expect(result.conversionRate).toBe(0)
  })
})
