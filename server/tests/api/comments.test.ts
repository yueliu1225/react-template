import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: commentDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_comment: commentDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/comments/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/comments/[id]/route')

const buildComment = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  uid: 2,
  type: 'article',
  type_id: 3,
  comment_id: 0,
  reply_uid: 0,
  content: 'Nice post!',
  praises: 0,
  ip: '127.0.0.1',
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/comments', () => {
  it('returns comments with metadata', async () => {
    const comment = buildComment()
    commentDelegate.findMany.mockResolvedValue([comment])
    commentDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/comments'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        uid: 2,
        type: 'article',
        typeId: 3,
        commentId: 0,
        replyUid: 0,
        content: 'Nice post!',
        praises: 0,
        ip: '127.0.0.1',
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        deleteTime: null,
      },
    ])

    const args = commentDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_commentFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/comments', () => {
  it('creates comment', async () => {
    const comment = buildComment()
    commentDelegate.create.mockResolvedValue(comment)

    const response = await POST(
      new Request('http://localhost/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: 2,
          type: 'article',
          typeId: 3,
          commentId: 1,
          replyUid: 1,
          content: 'Nice post!',
          praises: 0,
          ip: '127.0.0.1',
        }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.content).toBe('Nice post!')
  })

  it('rejects invalid payload', async () => {
    const response = await POST(
      new Request('http://localhost/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 2 }),
      }),
    )

    expect(response.status).toBe(400)
  })
})

describe('GET /api/comments/:id', () => {
  it('returns 404 when missing', async () => {
    commentDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/comments/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/comments/:id', () => {
  it('updates comment content', async () => {
    const updated = buildComment({ content: 'Updated comment' })
    commentDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/comments/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Updated comment' }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.content).toBe('Updated comment')
  })
})

describe('DELETE /api/comments/:id', () => {
  it('soft deletes comment', async () => {
    const deleted = buildComment({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    commentDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/comments/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
  })

  it('hard deletes when requested', async () => {
    commentDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/comments/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
