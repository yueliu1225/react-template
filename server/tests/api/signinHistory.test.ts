import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: historyDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_signin_history: historyDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/signin-history/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/signin-history/[id]/route')

const buildHistory = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  uid: 2,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/signin-history', () => {
  it('returns entries', async () => {
    const entry = buildHistory()
    historyDelegate.findMany.mockResolvedValue([entry])
    historyDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/signin-history'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        uid: 2,
        createTime: '2024-01-01T00:00:00.000Z',
        deleteTime: null,
      },
    ])

    const args = historyDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_signin_historyFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/signin-history', () => {
  it('creates entry', async () => {
    const entry = buildHistory()
    historyDelegate.create.mockResolvedValue(entry)

    const response = await POST(
      new Request('http://localhost/api/signin-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 2, createTime: '2024-01-01T00:00:00.000Z' }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.uid).toBe(2)
  })
})

describe('GET /api/signin-history/:id', () => {
  it('returns 404 when missing', async () => {
    historyDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/signin-history/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/signin-history/:id', () => {
  it('updates entry', async () => {
    const updated = buildHistory({ uid: 5 })
    historyDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/signin-history/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 5 }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.uid).toBe(5)
  })
})

describe('DELETE /api/signin-history/:id', () => {
  it('soft deletes entry', async () => {
    const deleted = buildHistory({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    historyDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/signin-history/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
  })

  it('hard deletes when requested', async () => {
    historyDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/signin-history/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
