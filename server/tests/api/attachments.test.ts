import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: attachmentDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_attachments: attachmentDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/attachments/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/attachments/[id]/route')

const buildAttachmentRecord = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  uid: 2,
  file: 'avatar.png',
  file_name: 'avatar.png',
  file_size: '1234',
  file_extension: 'png',
  parent_id: null,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/attachments', () => {
  it('returns paginated list', async () => {
    const attachment = buildAttachmentRecord()
    attachmentDelegate.findMany.mockResolvedValue([attachment])
    attachmentDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/attachments'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        uid: 2,
        file: 'avatar.png',
        fileName: 'avatar.png',
        fileSize: '1234',
        fileExtension: 'png',
        parentId: null,
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        deleteTime: null,
      },
    ])
    expect(body.meta.total).toBe(1)

    const args = attachmentDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_attachmentsFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/attachments', () => {
  it('creates attachment', async () => {
    const created = buildAttachmentRecord()
    attachmentDelegate.create.mockResolvedValue(created)

    const response = await POST(
      new Request('http://localhost/api/attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: 2,
          file: 'avatar.png',
          fileName: 'avatar.png',
          fileSize: '1234',
          fileExtension: 'png',
        }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.fileName).toBe('avatar.png')
  })

  it('rejects invalid payload', async () => {
    const response = await POST(
      new Request('http://localhost/api/attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: 'x' }),
      }),
    )

    expect(response.status).toBe(400)
  })
})

describe('GET /api/attachments/:id', () => {
  it('returns 404 when not found', async () => {
    attachmentDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/attachments/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/attachments/:id', () => {
  it('updates attachment', async () => {
    const updated = buildAttachmentRecord({ file_name: 'updated.png' })
    attachmentDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/attachments/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: 'updated.png' }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.fileName).toBe('updated.png')
  })
})

describe('DELETE /api/attachments/:id', () => {
  it('soft deletes by default', async () => {
    const deleted = buildAttachmentRecord({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    attachmentDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/attachments/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.deleteTime).toBe('2024-01-02T00:00:00.000Z')
  })

  it('hard deletes when requested', async () => {
    attachmentDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/attachments/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
