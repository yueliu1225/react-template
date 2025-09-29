import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: collectDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_collect: collectDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/collects/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/collects/[id]/route')

const buildCollect = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  uid: 2,
  type: 'article',
  type_id: 3,
  title: 'Interesting article',
  is_valid: true,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/collects', () => {
  it('returns collects', async () => {
    const collect = buildCollect()
    collectDelegate.findMany.mockResolvedValue([collect])
    collectDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/collects'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        uid: 2,
        type: 'article',
        typeId: 3,
        title: 'Interesting article',
        isValid: true,
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        deleteTime: null,
      },
    ])

    const args = collectDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_collectFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/collects', () => {
  it('creates collect and normalizes validity', async () => {
    const collect = buildCollect({ is_valid: false })
    collectDelegate.create.mockResolvedValue(collect)

    const response = await POST(
      new Request('http://localhost/api/collects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 2, type: 'article', typeId: 3, title: 'Interesting article', isValid: 0 }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.isValid).toBe(false)

    const createArgs = collectDelegate.create.mock.calls[0]?.[0]
    expect(createArgs?.data?.is_valid).toBe(false)
  })
})

describe('GET /api/collects/:id', () => {
  it('returns 404 when missing', async () => {
    collectDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/collects/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/collects/:id', () => {
  it('updates collect', async () => {
    const updated = buildCollect({ title: 'Updated', is_valid: false })
    collectDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/collects/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated', isValid: false }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.title).toBe('Updated')
    expect(body.data.isValid).toBe(false)
  })
})

describe('DELETE /api/collects/:id', () => {
  it('soft deletes collect', async () => {
    const deleted = buildCollect({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    collectDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/collects/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.deleteTime).toBe('2024-01-02T00:00:00.000Z')
  })

  it('hard deletes when requested', async () => {
    collectDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/collects/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
