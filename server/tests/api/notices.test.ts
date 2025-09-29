import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: noticeDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_notice: noticeDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/notices/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/notices/[id]/route')

const buildNotice = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  uid: 2,
  category: 'info',
  content: 'New feature available',
  send_uid: 3,
  is_new: true,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/notices', () => {
  it('returns notices with metadata', async () => {
    const notice = buildNotice()
    noticeDelegate.findMany.mockResolvedValue([notice])
    noticeDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/notices'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        uid: 2,
        category: 'info',
        content: 'New feature available',
        sendUid: 3,
        isNew: true,
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        deleteTime: null,
      },
    ])

    const args = noticeDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_noticeFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/notices', () => {
  it('creates notice and normalizes boolean', async () => {
    const notice = buildNotice({ is_new: false })
    noticeDelegate.create.mockResolvedValue(notice)

    const response = await POST(
      new Request('http://localhost/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 2, sendUid: 3, content: 'New feature available', isNew: 0 }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.isNew).toBe(false)
  })
})

describe('GET /api/notices/:id', () => {
  it('returns 404 when missing', async () => {
    noticeDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/notices/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/notices/:id', () => {
  it('updates notice', async () => {
    const updated = buildNotice({ is_new: false })
    noticeDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/notices/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isNew: false }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.isNew).toBe(false)
  })
})

describe('DELETE /api/notices/:id', () => {
  it('soft deletes notice', async () => {
    const deleted = buildNotice({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    noticeDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/notices/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
  })

  it('hard deletes when requested', async () => {
    noticeDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/notices/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
