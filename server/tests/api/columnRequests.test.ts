import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: columnRequestDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_column_request: columnRequestDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/column-requests/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/column-requests/[id]/route')

const buildRequest = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  uid: 2,
  title: 'New Column',
  thumbnail: '',
  summary: null,
  state: -1,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/column-requests', () => {
  it('returns requests with normalized state', async () => {
    const request = buildRequest({ state: 1 })
    columnRequestDelegate.findMany.mockResolvedValue([request])
    columnRequestDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/column-requests'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        uid: 2,
        title: 'New Column',
        thumbnail: '',
        summary: null,
        state: 'approved',
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        deleteTime: null,
      },
    ])

    const args = columnRequestDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_column_requestFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/column-requests', () => {
  it('creates request and maps state', async () => {
    const created = buildRequest({ state: 0 })
    columnRequestDelegate.create.mockResolvedValue(created)

    const response = await POST(
      new Request('http://localhost/api/column-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 2, title: 'New Column', state: 'rejected' }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.state).toBe('rejected')

    const createArgs = columnRequestDelegate.create.mock.calls[0]?.[0]
    expect(createArgs?.data?.state).toBe(0)
  })
})

describe('GET /api/column-requests/:id', () => {
  it('returns 404 when missing', async () => {
    columnRequestDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/column-requests/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/column-requests/:id', () => {
  it('updates request state', async () => {
    const updated = buildRequest({ state: 1 })
    columnRequestDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/column-requests/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 'approved' }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.state).toBe('approved')
  })
})

describe('DELETE /api/column-requests/:id', () => {
  it('marks request as deleted by default', async () => {
    const deleted = buildRequest({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    columnRequestDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/column-requests/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.deleteTime).toBe('2024-01-02T00:00:00.000Z')
  })

  it('hard deletes when requested', async () => {
    columnRequestDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/column-requests/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
