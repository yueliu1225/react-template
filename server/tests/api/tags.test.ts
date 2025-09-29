import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: tagDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_tags: tagDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/tags/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/tags/[id]/route')

const buildTag = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  title: 'frontend',
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  is_top: true,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/tags', () => {
  it('returns tags with booleans', async () => {
    const tag = buildTag({ is_top: false })
    tagDelegate.findMany.mockResolvedValue([tag])
    tagDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/tags'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        title: 'frontend',
        isTop: false,
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        deleteTime: null,
      },
    ])

    const args = tagDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_tagsFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/tags', () => {
  it('creates tag', async () => {
    const tag = buildTag()
    tagDelegate.create.mockResolvedValue(tag)

    const response = await POST(
      new Request('http://localhost/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'frontend', isTop: 1 }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.isTop).toBe(true)
  })
})

describe('GET /api/tags/:id', () => {
  it('returns 404 when missing', async () => {
    tagDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/tags/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/tags/:id', () => {
  it('updates tag', async () => {
    const updated = buildTag({ is_top: false })
    tagDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/tags/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTop: false }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.isTop).toBe(false)
  })
})

describe('DELETE /api/tags/:id', () => {
  it('soft deletes tag', async () => {
    const deleted = buildTag({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    tagDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/tags/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
  })

  it('hard deletes when requested', async () => {
    tagDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/tags/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
