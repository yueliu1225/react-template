import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: bannerDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_banner: bannerDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/banners/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/banners/[id]/route')

const buildBanner = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  image: 'hero.png',
  link_url: 'https://example.com',
  is_visible: true,
  create_time: new Date('2024-01-01T00:00:00.000Z'),
  update_time: null,
  delete_time: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/banners', () => {
  it('returns banners with metadata', async () => {
    const banner = buildBanner()
    bannerDelegate.findMany.mockResolvedValue([banner])
    bannerDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/banners'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data).toEqual([
      {
        id: 1,
        image: 'hero.png',
        linkUrl: 'https://example.com',
        isVisible: true,
        createTime: '2024-01-01T00:00:00.000Z',
        updateTime: null,
        deleteTime: null,
      },
    ])
    expect(body.meta.total).toBe(1)

    const args = bannerDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_bannerFindManyArgs
    expect(args?.where).toEqual({ delete_time: null })
  })
})

describe('POST /api/banners', () => {
  it('creates banner', async () => {
    const banner = buildBanner()
    bannerDelegate.create.mockResolvedValue(banner)

    const response = await POST(
      new Request('http://localhost/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: 'hero.png', linkUrl: 'https://example.com', isVisible: 1 }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.isVisible).toBe(true)

    const createArgs = bannerDelegate.create.mock.calls[0]?.[0]
    expect(createArgs?.data?.is_visible).toBe(true)
  })
})

describe('GET /api/banners/:id', () => {
  it('returns 404 when missing', async () => {
    bannerDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/banners/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/banners/:id', () => {
  it('updates banner fields', async () => {
    const updated = buildBanner({ is_visible: false })
    bannerDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/banners/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: 0 }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.isVisible).toBe(false)
  })
})

describe('DELETE /api/banners/:id', () => {
  it('soft deletes by default', async () => {
    const deleted = buildBanner({ delete_time: new Date('2024-01-02T00:00:00.000Z') })
    bannerDelegate.update.mockResolvedValue(deleted)

    const response = await DELETE(new Request('http://localhost/api/banners/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.deleteTime).toBe('2024-01-02T00:00:00.000Z')
  })

  it('hard deletes when requested', async () => {
    bannerDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/banners/1?hard=true'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
