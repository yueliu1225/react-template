import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: historyDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_badge_history: historyDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/badge-history/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/badge-history/[id]/route')

const buildHistory = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  user_id: 2,
  badge_id: 3,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/badge-history', () => {
  it('returns history entries', async () => {
    const entry = buildHistory()
    historyDelegate.findMany.mockResolvedValue([entry])
    historyDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/badge-history'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        userId: 2,
        badgeId: 3,
        createTime: '2024-01-01T00:00:00.000Z',
      },
    ])
    expect(body.meta.total).toBe(1)

    const args = historyDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_badge_historyFindManyArgs
    expect(args?.where).toEqual({})
  })
})

describe('POST /api/badge-history', () => {
  it('creates history entry', async () => {
    const entry = buildHistory()
    historyDelegate.create.mockResolvedValue(entry)

    const response = await POST(
      new Request('http://localhost/api/badge-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 2, badgeId: 3, createTime: '2024-01-01T00:00:00.000Z' }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.badgeId).toBe(3)
  })
})

describe('GET /api/badge-history/:id', () => {
  it('returns 404 when entry missing', async () => {
    historyDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/badge-history/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/badge-history/:id', () => {
  it('updates entry', async () => {
    const updated = buildHistory({ user_id: 4 })
    historyDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/badge-history/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 4 }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.userId).toBe(4)
  })
})

describe('DELETE /api/badge-history/:id', () => {
  it('hard deletes entry', async () => {
    historyDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/badge-history/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
