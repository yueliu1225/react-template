import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: praiseDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_praise: praiseDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/praises/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/praises/[id]/route')

const buildPraise = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  uid: 2,
  type: 'article',
  type_id: 3,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/praises', () => {
  it('returns praises', async () => {
    const praise = buildPraise()
    praiseDelegate.findMany.mockResolvedValue([praise])
    praiseDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/praises'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        uid: 2,
        type: 'article',
        typeId: 3,
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        deleteTime: null,
      },
    ])

    const args = praiseDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_praiseFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/praises', () => {
  it('creates praise entry', async () => {
    const praise = buildPraise()
    praiseDelegate.create.mockResolvedValue(praise)

    const response = await POST(
      new Request('http://localhost/api/praises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 2, type: 'article', typeId: 3 }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.type).toBe('article')
  })
})

describe('GET /api/praises/:id', () => {
  it('returns 404 when missing', async () => {
    praiseDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/praises/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/praises/:id', () => {
  it('updates praise entry', async () => {
    const updated = buildPraise({ type_id: 5 })
    praiseDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/praises/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typeId: 5 }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.typeId).toBe(5)
  })
})

describe('DELETE /api/praises/:id', () => {
  it('soft deletes praise', async () => {
    const deleted = buildPraise({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    praiseDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/praises/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
  })

  it('hard deletes when requested', async () => {
    praiseDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/praises/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
