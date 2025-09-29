import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: roleDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_manager_role: roleDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/manager-roles/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/manager-roles/[id]/route')

const buildRole = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  title: 'Admin',
  permissions: { dashboard: true },
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/manager-roles', () => {
  it('returns roles with metadata', async () => {
    const role = buildRole()
    roleDelegate.findMany.mockResolvedValue([role])
    roleDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/manager-roles'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        title: 'Admin',
        permissions: { dashboard: true },
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        deleteTime: null,
      },
    ])

    const args = roleDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_manager_roleFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/manager-roles', () => {
  it('creates manager role', async () => {
    const role = buildRole()
    roleDelegate.create.mockResolvedValue(role)

    const response = await POST(
      new Request('http://localhost/api/manager-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Admin', permissions: { dashboard: true } }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.title).toBe('Admin')
  })
})

describe('GET /api/manager-roles/:id', () => {
  it('returns 404 when missing', async () => {
    roleDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/manager-roles/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/manager-roles/:id', () => {
  it('updates role permissions', async () => {
    const updated = buildRole({ permissions: { dashboard: false } })
    roleDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/manager-roles/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: { dashboard: false } }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.permissions).toEqual({ dashboard: false })
  })
})

describe('DELETE /api/manager-roles/:id', () => {
  it('soft deletes role', async () => {
    const deleted = buildRole({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    roleDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/manager-roles/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.deleteTime).toBe('2024-01-02T00:00:00.000Z')
  })

  it('hard deletes when requested', async () => {
    roleDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/manager-roles/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
