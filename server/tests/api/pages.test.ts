import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: pageDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_page: pageDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/pages/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/pages/[id]/route')

const buildPage = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  url: '/about',
  is_nav: false,
  is_show: true,
  title: 'About',
  content: null,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/pages', () => {
  it('returns pages with metadata', async () => {
    const page = buildPage()
    pageDelegate.findMany.mockResolvedValue([page])
    pageDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/pages'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        url: '/about',
        title: 'About',
        isNav: false,
        isShow: true,
        content: null,
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        deleteTime: null,
      },
    ])

    const args = pageDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_pageFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/pages', () => {
  it('creates page and normalizes booleans', async () => {
    const page = buildPage({ is_nav: true, is_show: false })
    pageDelegate.create.mockResolvedValue(page)

    const response = await POST(
      new Request('http://localhost/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: '/about', title: 'About', isNav: 1, isShow: 0 }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.isNav).toBe(true)
    expect(body.data.isShow).toBe(false)
  })
})

describe('GET /api/pages/:id', () => {
  it('returns 404 when missing', async () => {
    pageDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/pages/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/pages/:id', () => {
  it('updates page fields', async () => {
    const updated = buildPage({ title: 'About Us', is_nav: true })
    pageDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/pages/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'About Us', isNav: true }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.title).toBe('About Us')
    expect(body.data.isNav).toBe(true)
  })
})

describe('DELETE /api/pages/:id', () => {
  it('soft deletes page', async () => {
    const deleted = buildPage({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    pageDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/pages/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
  })

  it('hard deletes when requested', async () => {
    pageDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/pages/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
