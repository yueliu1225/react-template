import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: followDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_follow: followDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/follows/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/follows/[id]/route')

const buildFollow = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  uid: 2,
  type_id: 5,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/follows', () => {
  it('returns follows with metadata', async () => {
    const follow = buildFollow()
    followDelegate.findMany.mockResolvedValue([follow])
    followDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/follows'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        uid: 2,
        typeId: 5,
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        deleteTime: null,
      },
    ])

    const args = followDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_followFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/follows', () => {
  it('creates follow entry', async () => {
    const follow = buildFollow()
    followDelegate.create.mockResolvedValue(follow)

    const response = await POST(
      new Request('http://localhost/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 2, typeId: 5 }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.typeId).toBe(5)
  })
})

describe('GET /api/follows/:id', () => {
  it('returns 404 when follow missing', async () => {
    followDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/follows/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/follows/:id', () => {
  it('updates follow entry', async () => {
    const updated = buildFollow({ type_id: 9 })
    followDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/follows/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typeId: 9 }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.typeId).toBe(9)
  })
})

describe('DELETE /api/follows/:id', () => {
  it('soft deletes follow', async () => {
    const deleted = buildFollow({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    followDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/follows/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
  })

  it('hard deletes when requested', async () => {
    followDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/follows/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
