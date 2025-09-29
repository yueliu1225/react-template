import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import type { Prisma } from '@prisma/client'
import { createPrismaDelegateMock } from '../helpers/prismaMock'

const { delegate: settingDelegate, reset: resetDelegate } = createPrismaDelegateMock()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mo_setting: settingDelegate,
  },
}))

const { GET, POST } = await import('@/app/api/settings/route')
const { GET: GET_BY_ID, PUT, DELETE } = await import('@/app/api/settings/[id]/route')

const buildSetting = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  title: 'Site',
  title_en: 'Site',
  keywords: 'site',
  keywords_en: 'site',
  description: 'desc',
  description_en: 'desc',
  logo: '/logo.png',
  logo2: '/logo2.png',
  favicon: '/favicon.ico',
  footer: null,
  smtp: null,
  i18n: null,
  ...overrides,
})

beforeEach(() => resetDelegate())
afterAll(() => resetDelegate())

describe('GET /api/settings', () => {
  it('returns settings list', async () => {
    const setting = buildSetting()
    settingDelegate.findMany.mockResolvedValue([setting])
    settingDelegate.count.mockResolvedValue(1)

    const response = await GET(new Request('http://localhost/api/settings'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data[0].title).toBe('Site')
    expect(body.meta.total).toBe(1)

    const args = settingDelegate.findMany.mock.calls[0]?.[0] as Prisma.mo_settingFindManyArgs
    expect(args?.where).toEqual({})
  })
})

describe('POST /api/settings', () => {
  it('creates setting', async () => {
    const setting = buildSetting()
    settingDelegate.create.mockResolvedValue(setting)

    const response = await POST(
      new Request('http://localhost/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Site',
          titleEn: 'Site',
          keywords: 'site',
          keywordsEn: 'site',
          description: 'desc',
          descriptionEn: 'desc',
          logo: '/logo.png',
          logo2: '/logo2.png',
          favicon: '/favicon.ico',
        }),
      }),
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.title).toBe('Site')
  })
})

describe('GET /api/settings/:id', () => {
  it('returns 404 when missing', async () => {
    settingDelegate.findUnique.mockResolvedValue(null)

    const response = await GET_BY_ID(new Request('http://localhost/api/settings/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/settings/:id', () => {
  it('updates setting', async () => {
    const updated = buildSetting({ title: 'Updated' })
    settingDelegate.update.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/settings/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.title).toBe('Updated')
  })
})

describe('DELETE /api/settings/:id', () => {
  it('hard deletes setting', async () => {
    settingDelegate.delete.mockResolvedValue({})

    const response = await DELETE(new Request('http://localhost/api/settings/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
