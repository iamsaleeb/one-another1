// Bypass React's cache() so functions behave as regular async functions in tests
jest.mock('react', () => ({
  cache: (fn: unknown) => fn,
}))

jest.mock('@/lib/db', () => ({
  prisma: {
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    church: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

import {
  getEvents,
  getPastEvents,
  getEventById,
  getChurches,
  getChurchById,
  searchEventsAndChurches,
} from '@/lib/actions/data'
import { prisma } from '@/lib/db'

const mockEventFindMany = prisma.event.findMany as jest.Mock
const mockEventFindUnique = prisma.event.findUnique as jest.Mock
const mockChurchFindMany = prisma.church.findMany as jest.Mock
const mockChurchFindUnique = prisma.church.findUnique as jest.Mock

const sampleEvent = {
  id: 'evt-1',
  title: 'Sunday Service',
  datetime: '2026-03-16T09:00:00Z',
  location: 'Main Hall',
  host: 'Pastor John',
  tag: 'Worship',
  isPast: false,
  createdAt: new Date(),
}

const sampleChurch = {
  id: 'ch-1',
  name: 'Grace Church',
  denomination: 'Baptist',
  address: '123 Church St',
  serviceTimes: [],
  events: [],
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getEvents', () => {
  it('returns upcoming events ordered by createdAt asc', async () => {
    mockEventFindMany.mockResolvedValue([sampleEvent])
    const result = await getEvents()
    expect(result).toEqual([sampleEvent])
    expect(mockEventFindMany).toHaveBeenCalledWith({
      where: { isPast: false },
      orderBy: { createdAt: 'asc' },
    })
  })

  it('returns an empty array when there are no upcoming events', async () => {
    mockEventFindMany.mockResolvedValue([])
    expect(await getEvents()).toEqual([])
  })
})

describe('getPastEvents', () => {
  it('returns past events ordered by createdAt asc', async () => {
    const pastEvent = { ...sampleEvent, id: 'evt-past', isPast: true }
    mockEventFindMany.mockResolvedValue([pastEvent])
    const result = await getPastEvents()
    expect(result).toEqual([pastEvent])
    expect(mockEventFindMany).toHaveBeenCalledWith({
      where: { isPast: true },
      orderBy: { createdAt: 'asc' },
    })
  })
})

describe('getEventById', () => {
  it('returns the matching event', async () => {
    mockEventFindUnique.mockResolvedValue(sampleEvent)
    const result = await getEventById('evt-1')
    expect(result).toEqual(sampleEvent)
    expect(mockEventFindUnique).toHaveBeenCalledWith({ where: { id: 'evt-1' } })
  })

  it('returns null when the event does not exist', async () => {
    mockEventFindUnique.mockResolvedValue(null)
    expect(await getEventById('not-found')).toBeNull()
  })
})

describe('getChurches', () => {
  it('returns churches ordered by name with serviceTimes and events included', async () => {
    mockChurchFindMany.mockResolvedValue([sampleChurch])
    const result = await getChurches()
    expect(result).toEqual([sampleChurch])
    expect(mockChurchFindMany).toHaveBeenCalledWith({
      include: {
        serviceTimes: true,
        events: { where: { isPast: false } },
      },
      orderBy: { name: 'asc' },
    })
  })
})

describe('getChurchById', () => {
  it('returns the matching church', async () => {
    mockChurchFindUnique.mockResolvedValue(sampleChurch)
    const result = await getChurchById('ch-1')
    expect(result).toEqual(sampleChurch)
    expect(mockChurchFindUnique).toHaveBeenCalledWith({
      where: { id: 'ch-1' },
      include: {
        serviceTimes: true,
        events: { where: { isPast: false } },
      },
    })
  })

  it('returns null when the church does not exist', async () => {
    mockChurchFindUnique.mockResolvedValue(null)
    expect(await getChurchById('missing')).toBeNull()
  })
})

describe('searchEventsAndChurches', () => {
  it('runs parallel queries for events and churches', async () => {
    mockEventFindMany.mockResolvedValue([sampleEvent])
    mockChurchFindMany.mockResolvedValue([sampleChurch])

    const result = await searchEventsAndChurches('grace')

    expect(result).toEqual({ events: [sampleEvent], churches: [sampleChurch] })
  })

  it('searches events across title, location, host, and tag fields', async () => {
    mockEventFindMany.mockResolvedValue([])
    mockChurchFindMany.mockResolvedValue([])

    await searchEventsAndChurches('worship')

    expect(mockEventFindMany).toHaveBeenCalledWith({
      where: {
        isPast: false,
        OR: [
          { title: { contains: 'worship', mode: 'insensitive' } },
          { location: { contains: 'worship', mode: 'insensitive' } },
          { host: { contains: 'worship', mode: 'insensitive' } },
          { tag: { contains: 'worship', mode: 'insensitive' } },
        ],
      },
    })
  })

  it('searches churches across name, denomination, and address fields', async () => {
    mockEventFindMany.mockResolvedValue([])
    mockChurchFindMany.mockResolvedValue([])

    await searchEventsAndChurches('baptist')

    expect(mockChurchFindMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: 'baptist', mode: 'insensitive' } },
          { denomination: { contains: 'baptist', mode: 'insensitive' } },
          { address: { contains: 'baptist', mode: 'insensitive' } },
        ],
      },
    })
  })

  it('returns empty arrays when nothing matches', async () => {
    mockEventFindMany.mockResolvedValue([])
    mockChurchFindMany.mockResolvedValue([])

    expect(await searchEventsAndChurches('zzznomatch')).toEqual({
      events: [],
      churches: [],
    })
  })
})
