import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: badgeDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_badge: badgeDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/badges/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/badges/[id]/route')

const buildBadge = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  name: 'Contributor',
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/badges', () => {
  it('returns badge list with metadata', async () => {
    const badge = buildBadge()
    badgeDelegate.findMany.mockResolvedValue([badge])
    badgeDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/badges'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([{ id: 1, name: 'Contributor' }])
    expect(body.meta.total).toBe(1)

    const args = badgeDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_badgeFindManyArgs
    expect(args?.where).toEqual({})
  })
})

describe('POST /api/badges', () => {
  it('creates badge', async () => {
    const badge = buildBadge()
    badgeDelegate.create.mockResolvedValue(badge)

    const response = await POST(
      new Request('http://localhost/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 1, name: 'Contributor' }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data).toEqual({ id: 1, name: 'Contributor' })
  })

  it('rejects invalid payload', async () => {
    const response = await POST(
      new Request('http://localhost/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Missing id' }),
      }),
    )

    expect(response.status).toBe(400)
  })
})

describe('GET /api/badges/:id', () => {
  it('returns 404 for missing badge', async () => {
    badgeDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/badges/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/badges/:id', () => {
  it('updates badge name', async () => {
    const badge = buildBadge({ name: 'Maintainer' })
    badgeDelegate.update.mockResolvedValue(badge)

    const response = await PUT(
      new Request('http://localhost/api/badges/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Maintainer' }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.name).toBe('Maintainer')
  })
})

describe('DELETE /api/badges/:id', () => {
  it('hard deletes badge', async () => {
    badgeDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/badges/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(badgeDelegate.delete).toHaveBeenCalled()
  })
})
