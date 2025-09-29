import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: columnDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_column: columnDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/columns/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/columns/[id]/route')

const buildColumn = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  uid: 2,
  title: 'Frontend Tips',
  summary: null,
  thumbnail: '',
  collects: 0,
  articles: 0,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/columns', () => {
  it('returns columns', async () => {
    const column = buildColumn()
    columnDelegate.findMany.mockResolvedValue([column])
    columnDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/columns'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        uid: 2,
        title: 'Frontend Tips',
        summary: null,
        thumbnail: '',
        collects: 0,
        articles: 0,
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        deleteTime: null,
      },
    ])

    const args = columnDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_columnFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/columns', () => {
  it('creates column', async () => {
    const column = buildColumn()
    columnDelegate.create.mockResolvedValue(column)

    const response = await POST(
      new Request('http://localhost/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 2, title: 'Frontend Tips', summary: 'tips' }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.title).toBe('Frontend Tips')
  })
})

describe('GET /api/columns/:id', () => {
  it('returns 404 when missing', async () => {
    columnDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/columns/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/columns/:id', () => {
  it('updates column', async () => {
    const updated = buildColumn({ title: 'Updated Title' })
    columnDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/columns/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.title).toBe('Updated Title')
  })
})

describe('DELETE /api/columns/:id', () => {
  it('soft deletes column', async () => {
    const deleted = buildColumn({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    columnDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/columns/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.deleteTime).toBe('2024-01-02T00:00:00.000Z')
  })

  it('hard deletes when requested', async () => {
    columnDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/columns/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
