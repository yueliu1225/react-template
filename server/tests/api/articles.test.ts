import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: articleDelegate, reset: resetDelegateMocks } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_article: articleDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/articles/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/articles/[id]/route')

const buildArticleRecord = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  column_id: 2,
  title: 'Sample Article',
  summary: null,
  tags: null,
  content: 'Hello world',
  views: 0,
  praises: 0,
  collects: 0,
  comments: 0,
  state: true,
  top_time: null,
  author_top_time: null,
  publish_time: null,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  attachments: null,
  ...overrides,
})

beforeEach(() => {
  resetDelegateMocks()
})

afterAll(() => {
  resetDelegateMocks()
})

describe('GET /api/articles', () => {
  it('returns paginated data and metadata', async () => {
    const article = buildArticleRecord()
    articleDelegate.findMany.mockResolvedValue([article])
    articleDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/articles'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        columnId: 2,
        title: 'Sample Article',
        summary: null,
        tags: null,
        content: 'Hello world',
        views: 0,
        praises: 0,
        collects: 0,
        comments: 0,
        state: true,
        topTime: null,
        authorTopTime: null,
        publishTime: null,
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        attachments: null,
      },
    ])
    expect(body.meta).toEqual({
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    })

    const findManyArgs = articleDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_articleFindManyArgs
    expect(findManyArgs).toBeDefined()
    expect(findManyArgs?.where).toEqual({ delete_time: null })
    expect(findManyArgs?.orderBy).toEqual([
      { publish_time: 'desc' },
      { create_time: 'desc' },
    ])
  })

  it('returns 400 for invalid query parameters', async () => {
    const response = await GET(new Request('http://localhost/api/articles?pageSize=0'))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Invalid query parameters')
  })
})

describe('POST /api/articles', () => {
  it('creates article and normalizes boolean fields', async () => {
    const article = buildArticleRecord({ state: true })
    articleDelegate.create.mockResolvedValue(article)

    const payload = {
      title: 'Sample Article',
      content: 'Hello world',
      columnId: 2,
      state: 1,
    }

    const response = await POST(
      new Request('http://localhost/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.state).toBe(true)

    const createArgs = articleDelegate.create.mock.calls[0]?.[0]
    expect(createArgs?.data?.state).toBe(true)
  })

  it('returns 400 when payload is invalid', async () => {
    const response = await POST(
      new Request('http://localhost/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId: 1 }),
      }),
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Invalid article payload')
  })
})

describe('GET /api/articles/:id', () => {
  it('returns 404 when article is missing', async () => {
    articleDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/articles/99'), {
      params: Promise.resolve({ id: '99' }),
    })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBe('Article not found')
  })
})

describe('PUT /api/articles/:id', () => {
  it('updates article and surfaces normalized state', async () => {
    const article = buildArticleRecord({ state: false })
    articleDelegate.update.mockResolvedValue(article)

    const response = await PUT(
      new Request('http://localhost/api/articles/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 0 }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.state).toBe(false)

    const updateArgs = articleDelegate.update.mock.calls[0]?.[0]
    expect(updateArgs?.data?.state).toBe(false)
  })

  it('returns 400 when no updatable fields provided', async () => {
    const response = await PUT(
      new Request('http://localhost/api/articles/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('No updatable fields provided')
  })
})

describe('DELETE /api/articles/:id', () => {
  it('soft deletes by default', async () => {
    const deleted = buildArticleRecord({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    articleDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/articles/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.state).toBe(true)

    const updateArgs = articleDelegate.update.mock.calls[0]?.[0]
    expect(updateArgs?.data?.delete_time).toBeInstanceOf(Date)
  })

  it('hard deletes when requested', async () => {
    articleDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/articles/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)

    expect(articleDelegate.delete).toHaveBeenCalledTimes(1)
    expect(articleDelegate.delete.mock.calls[0]?.[0]).toEqual({ where: { id: 1 } })
  })
})
