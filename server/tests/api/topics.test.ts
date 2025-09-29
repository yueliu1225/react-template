import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: topicDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_topic: topicDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/topics/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/topics/[id]/route')

const buildTopic = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  uid: 2,
  title: 'State Management',
  summary: null,
  tags: ['redux'],
  content: 'Discuss state libraries',
  views: 0,
  praises: 0,
  collects: 0,
  comments: 0,
  state: true,
  top_time: null,
  publish_time: null,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  attachments: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/topics', () => {
  it('returns topics with meta', async () => {
    const topic = buildTopic()
    topicDelegate.findMany.mockResolvedValue([topic])
    topicDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/topics'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data[0].title).toBe('State Management')
    expect(body.data[0].state).toBe(true)
    expect(body.meta.total).toBe(1)

    const args = topicDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_topicFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/topics', () => {
  it('creates topic and normalizes state', async () => {
    const topic = buildTopic({ state: false })
    topicDelegate.create.mockResolvedValue(topic)

    const response = await POST(
      new Request('http://localhost/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'State Management', content: 'Discuss', state: 0 }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.state).toBe(false)
  })
})

describe('GET /api/topics/:id', () => {
  it('returns 404 when missing', async () => {
    topicDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/topics/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/topics/:id', () => {
  it('updates topic state', async () => {
    const topic = buildTopic({ state: false })
    topicDelegate.update.mockResolvedValue(topic)

    const response = await PUT(
      new Request('http://localhost/api/topics/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: false }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.state).toBe(false)
  })
})

describe('DELETE /api/topics/:id', () => {
  it('soft deletes topic', async () => {
    const deleted = buildTopic({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    topicDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/topics/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
  })

  it('hard deletes when requested', async () => {
    topicDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/topics/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
