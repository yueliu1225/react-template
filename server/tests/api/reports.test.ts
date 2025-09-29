import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: reportDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_report: reportDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/reports/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/reports/[id]/route')

const buildReport = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  uid: 2,
  type: 'comment',
  type_id: 3,
  category: 0,
  summary: 'Spam content',
  state: -1,
  type_data: null,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/reports', () => {
  it('returns reports with normalized state', async () => {
    const report = buildReport({ state: 1 })
    reportDelegate.findMany.mockResolvedValue([report])
    reportDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/reports'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        uid: 2,
        type: 'comment',
        typeId: 3,
        category: 0,
        summary: 'Spam content',
        state: 'approved',
        typeData: null,
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        deleteTime: null,
      },
    ])

    const args = reportDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_reportFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/reports', () => {
  it('creates report with state mapping', async () => {
    const created = buildReport({ state: 0 })
    reportDelegate.create.mockResolvedValue(created)

    const response = await POST(
      new Request('http://localhost/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 2, type: 'comment', typeId: 3, state: 'rejected' }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.state).toBe('rejected')

    const createArgs = reportDelegate.create.mock.calls[0]?.[0]
    expect(createArgs?.data?.state).toBe(0)
  })
})

describe('GET /api/reports/:id', () => {
  it('returns 404 when missing', async () => {
    reportDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/reports/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/reports/:id', () => {
  it('updates report state', async () => {
    const updated = buildReport({ state: 1 })
    reportDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/reports/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 'approved' }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.state).toBe('approved')
  })
})

describe('DELETE /api/reports/:id', () => {
  it('soft deletes report', async () => {
    const deleted = buildReport({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    reportDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/reports/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
  })

  it('hard deletes when requested', async () => {
    reportDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/reports/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
