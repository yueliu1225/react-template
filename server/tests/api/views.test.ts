import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: viewsDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_views: viewsDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/views/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/views/[id]/route')

const buildView = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  uid: 2,
  content_type: 'article',
  content_id: 10,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/views', () => {
  it('returns view entries', async () => {
    const view = buildView()
    viewsDelegate.findMany.mockResolvedValue([view])
    viewsDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/views'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        uid: 2,
        contentType: 'article',
        contentId: 10,
        createTime: '2024-01-01T00:00:00.000Z',
        deleteTime: null,
      },
    ])

    const args = viewsDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_viewsFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/views', () => {
  it('creates view entry', async () => {
    const view = buildView()
    viewsDelegate.create.mockResolvedValue(view)

    const response = await POST(
      new Request('http://localhost/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 2, contentType: 'article', contentId: 10 }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.contentType).toBe('article')
  })
})

describe('GET /api/views/:id', () => {
  it('returns 404 when missing', async () => {
    viewsDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/views/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/views/:id', () => {
  it('updates entry', async () => {
    const updated = buildView({ content_type: 'topic' })
    viewsDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/views/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'topic' }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.contentType).toBe('topic')
  })
})

describe('DELETE /api/views/:id', () => {
  it('soft deletes view', async () => {
    const deleted = buildView({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    viewsDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/views/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
  })

  it('hard deletes when requested', async () => {
    viewsDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/views/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
