import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: vcodeDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_vcode: vcodeDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/vcodes/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/vcodes/[id]/route')

const buildVcode = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  account: 'user@example.com',
  code: '123456',
  ip: '127.0.0.1',
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/vcodes', () => {
  it('returns vcodes', async () => {
    const vcode = buildVcode()
    vcodeDelegate.findMany.mockResolvedValue([vcode])
    vcodeDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/vcodes'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data[0].code).toBe('123456')

    const args = vcodeDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_vcodeFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/vcodes', () => {
  it('creates verification code', async () => {
    const vcode = buildVcode()
    vcodeDelegate.create.mockResolvedValue(vcode)

    const response = await POST(
      new Request('http://localhost/api/vcodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: 'user@example.com', code: '123456', ip: '127.0.0.1' }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.code).toBe('123456')
  })
})

describe('GET /api/vcodes/:id', () => {
  it('returns 404 when missing', async () => {
    vcodeDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/vcodes/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/vcodes/:id', () => {
  it('updates verification code', async () => {
    const updated = buildVcode({ account: 'new@example.com' })
    vcodeDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/vcodes/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: 'new@example.com' }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.account).toBe('new@example.com')
  })
})

describe('DELETE /api/vcodes/:id', () => {
  it('soft deletes verification code', async () => {
    const deleted = buildVcode({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    vcodeDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/vcodes/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
  })

  it('hard deletes when requested', async () => {
    vcodeDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/vcodes/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
