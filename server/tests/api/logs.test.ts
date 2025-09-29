import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: logDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_log: logDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/logs/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/logs/[id]/route')

const buildLog = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  uid: 2,
  type: 'login',
  content: 'Successful login',
  success: 1,
  ip: '127.0.0.1',
  manage: false,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/logs', () => {
  it('returns logs', async () => {
    const log = buildLog()
    logDelegate.findMany.mockResolvedValue([log])
    logDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/logs'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        uid: 2,
        type: 'login',
        content: 'Successful login',
        success: true,
        ip: '127.0.0.1',
        manage: false,
        createTime: '2024-01-01T00:00:00.000Z',
        deleteTime: null,
      },
    ])

    const args = logDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_logFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/logs', () => {
  it('creates log entry', async () => {
    const log = buildLog()
    logDelegate.create.mockResolvedValue(log)

    const response = await POST(
      new Request('http://localhost/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 2, type: 'login', content: 'Successful login', success: true }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.success).toBe(true)

    const createArgs = logDelegate.create.mock.calls[0]?.[0]
    expect(createArgs?.data?.success).toBe(1)
  })
})

describe('GET /api/logs/:id', () => {
  it('returns 404 when missing', async () => {
    logDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/logs/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/logs/:id', () => {
  it('updates log entry', async () => {
    const updated = buildLog({ success: 0 })
    logDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/logs/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.success).toBe(false)
  })
})

describe('DELETE /api/logs/:id', () => {
  it('hard deletes log entry', async () => {
    logDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/logs/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
