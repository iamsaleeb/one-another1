jest.mock('@/lib/db', () => ({
  prisma: {
    notification: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('@/lib/notifications', () => ({
  sendPushToUsers: jest.fn(),
}))

import { prisma } from '@/lib/db'
import { sendPushToUsers } from '@/lib/notifications'
import { processNotifications } from '@/lib/notifications/process'

const mockFindMany = prisma.notification.findMany as jest.Mock
const mockUpdate = prisma.notification.update as jest.Mock
const mockSendPush = sendPushToUsers as jest.Mock

const mockNotif = (overrides: Record<string, unknown> = {}) => ({
  id: 'n-1',
  userId: 'u-1',
  type: 'EVENT_REMINDER',
  title: 'Event soon',
  body: 'In 1 hour',
  data: { type: 'EVENT_REMINDER', eventId: 'ev-1' },
  scheduledFor: new Date(Date.now() - 1000),
  sentAt: null,
  cancelledAt: null,
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
  mockSendPush.mockResolvedValue(undefined)
  mockUpdate.mockResolvedValue({})
})

describe('processNotifications', () => {
  it('sends each notification and marks sentAt', async () => {
    const due = [
      mockNotif({ id: 'n-1', userId: 'u-1' }),
      mockNotif({ id: 'n-2', userId: 'u-2', type: 'EVENT_CANCELLED', title: 'Cancelled', body: 'Gone' }),
    ]
    mockFindMany.mockResolvedValue(due)

    const result = await processNotifications()

    expect(mockSendPush).toHaveBeenCalledTimes(2)
    expect(mockSendPush).toHaveBeenCalledWith(['u-1'], 'EVENT_REMINDER', 'Event soon', 'In 1 hour', due[0].data)
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 'n-1' }, data: { sentAt: expect.any(Date) } })
    expect(result).toEqual({ processed: 2 })
  })

  it('returns 0 when no due notifications', async () => {
    mockFindMany.mockResolvedValue([])

    const result = await processNotifications()
    expect(result).toEqual({ processed: 0 })
    expect(mockSendPush).not.toHaveBeenCalled()
  })

  it('counts only fulfilled sends in processed total', async () => {
    mockFindMany.mockResolvedValue([mockNotif()])
    mockSendPush.mockRejectedValueOnce(new Error('FCM error'))

    const result = await processNotifications()
    expect(result).toEqual({ processed: 0 })
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
