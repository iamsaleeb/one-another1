jest.mock('@/lib/db', () => ({
  prisma: {
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'
import { getInboxNotifications, getUnreadCount, markNotificationsRead } from '@/lib/notifications/inbox'

const mockFindMany = prisma.notification.findMany as jest.Mock
const mockCount = prisma.notification.count as jest.Mock
const mockUpdateMany = prisma.notification.updateMany as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getInboxNotifications', () => {
  it('fetches sent notifications ordered by sentAt desc', async () => {
    mockFindMany.mockResolvedValue([])

    await getInboxNotifications({ userId: 'u-1', page: 1, pageSize: 20 })

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: 'u-1', sentAt: { not: null } },
      orderBy: { sentAt: 'desc' },
      skip: 0,
      take: 20,
      select: { id: true, type: true, title: true, body: true, data: true, sentAt: true, readAt: true },
    })
  })

  it('paginates page 2 with skip=20', async () => {
    mockFindMany.mockResolvedValue([])
    await getInboxNotifications({ userId: 'u-1', page: 2, pageSize: 20 })
    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 20 }))
  })
})

describe('getUnreadCount', () => {
  it('counts sent+unread notifications', async () => {
    mockCount.mockResolvedValue(4)

    const count = await getUnreadCount('u-1')

    expect(mockCount).toHaveBeenCalledWith({
      where: { userId: 'u-1', sentAt: { not: null }, readAt: null },
    })
    expect(count).toBe(4)
  })
})

describe('markNotificationsRead', () => {
  it('sets readAt on all unread sent notifications for user', async () => {
    mockUpdateMany.mockResolvedValue({ count: 4 })

    await markNotificationsRead('u-1')

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { userId: 'u-1', sentAt: { not: null }, readAt: null },
      data: { readAt: expect.any(Date) },
    })
  })
})
