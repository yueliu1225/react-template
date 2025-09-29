import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { createHash } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: userDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_user: userDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/users/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/users/[id]/route')

const buildUser = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  mobile: '1234567890',
  email: 'user@example.com',
  password: 'hashed',
  nickname: 'User',
  avatar: '',
  gender: 1,
  org_type: true,
  org_title: '',
  praises: 0,
  follows: 0,
  fans: 0,
  topics: 0,
  articles: 0,
  state: 1,
  summary: '',
  manager_role_id: 0,
  token: '',
  token_time: 0,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  curr_duration: 0,
  max_duration: 0,
  last_sign_in_date: new Date('2024-01-01T00:00:00.000Z'),
  points: 0,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/users', () => {
  it('returns paginated users without sensitive fields', async () => {
    const user = buildUser()
    userDelegate.findMany.mockResolvedValue([user])
    userDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/users'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data[0]).toEqual({
      id: 1,
      mobile: '1234567890',
      email: 'user@example.com',
      nickname: 'User',
      avatar: null,
      gender: 1,
      orgType: true,
      orgTitle: null,
      praises: 0,
      follows: 0,
      fans: 0,
      topics: 0,
      articles: 0,
      state: 'active',
      summary: null,
      managerRoleId: 0,
      createTime: '2024-01-01T00:00:00.000Z',
      updateTime: null,
      deleteTime: null,
      currDuration: 0,
      maxDuration: 0,
      lastSignInDate: '2024-01-01T00:00:00.000Z',
      points: 0,
    })
    expect(body.data[0]).not.toHaveProperty('password')

    const args = userDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_userFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/users', () => {
  it('creates user and hashes password', async () => {
    const user = buildUser({ password: 'hashedValue', state: -1 })
    userDelegate.create.mockResolvedValue(user)

    const response = await POST(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'password123',
          nickname: 'User',
          orgType: true,
          state: 'pending',
        }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.email).toBe('user@example.com')
    expect(body.data.state).toBe('pending')
    expect(body.data).not.toHaveProperty('password')

    const createArgs = userDelegate.create.mock.calls[0]?.[0]
    const expectedHash = createHash('sha256').update('password123').digest('hex')
    expect(createArgs?.data?.password).toBe(expectedHash)
    expect(createArgs?.data?.state).toBe(-1)
  })

  it('rejects invalid payload', async () => {
    const response = await POST(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid' }),
      }),
    )

    expect(response.status).toBe(400)
  })
})

describe('GET /api/users/:id', () => {
  it('returns 404 when user soft deleted', async () => {
    const user = buildUser({ delete_time: new Date() })
    userDelegate.findUnique.mockResolvedValue(user)

    const response = await GET_BY_ID(new Request('http://localhost/api/users/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/users/:id', () => {
  it('updates allowed fields and hashes password when provided', async () => {
    const user = buildUser({ password: 'hashedNew', nickname: 'Updated' })
    userDelegate.update.mockResolvedValue(user)

    const response = await PUT(
      new Request('http://localhost/api/users/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Updated', password: 'newpass123' }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.nickname).toBe('Updated')

    const updateArgs = userDelegate.update.mock.calls[0]?.[0]
    const expectedHash = createHash('sha256').update('newpass123').digest('hex')
    expect(updateArgs?.data?.password).toBe(expectedHash)
  })

  it('returns 400 when no updatable fields provided', async () => {
    const response = await PUT(
      new Request('http://localhost/api/users/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('No updatable fields provided')
  })
})

describe('DELETE /api/users/:id', () => {
  it('soft deletes by default', async () => {
    const deleted = buildUser({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    userDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/users/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.deleteTime).toBe('2024-01-02T00:00:00.000Z')
  })

  it('hard deletes when requested', async () => {
    userDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/users/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
