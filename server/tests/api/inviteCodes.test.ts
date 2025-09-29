import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: inviteDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_invite_code: inviteDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/invite-codes/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/invite-codes/[id]/route')

const buildInvite = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  uid: 2,
  code: 'ABC123',
  contact: 'me@example.com',
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/invite-codes', () => {
  it('returns invite codes', async () => {
    const invite = buildInvite()
    inviteDelegate.findMany.mockResolvedValue([invite])
    inviteDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/invite-codes'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        uid: 2,
        code: 'ABC123',
        contact: 'me@example.com',
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        deleteTime: null,
      },
    ])

    const args = inviteDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_invite_codeFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/invite-codes', () => {
  it('creates invite code', async () => {
    const invite = buildInvite()
    inviteDelegate.create.mockResolvedValue(invite)

    const response = await POST(
      new Request('http://localhost/api/invite-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 2, code: 'ABC123', contact: 'me@example.com' }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.code).toBe('ABC123')
  })
})

describe('GET /api/invite-codes/:id', () => {
  it('returns 404 when missing', async () => {
    inviteDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/invite-codes/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/invite-codes/:id', () => {
  it('updates invite code', async () => {
    const updated = buildInvite({ contact: 'new@example.com' })
    inviteDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/invite-codes/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: 'new@example.com' }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.contact).toBe('new@example.com')
  })
})

describe('DELETE /api/invite-codes/:id', () => {
  it('soft deletes invite code', async () => {
    const deleted = buildInvite({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    inviteDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/invite-codes/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
  })

  it('hard deletes when requested', async () => {
    inviteDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/invite-codes/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
