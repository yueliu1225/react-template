import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { settingCreateSchema, settingQuerySchema } from './setting.schema'
import { buildSettingCreateData, toSettingDto } from '@/lib/settings'

type ErrorPayload = {
  error: string
  details?: unknown
}

const badRequest = (message: string, details?: unknown) =>
  NextResponse.json<ErrorPayload>({ error: message, details }, { status: 400 })

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const rawParams = Object.fromEntries(url.searchParams.entries())
    const parsed = settingQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, search } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_settingWhereInput = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { title_en: { contains: search } },
        { keywords: { contains: search } },
      ]
    }

    const [settings, total] = await Promise.all([
      prisma.mo_setting.findMany({
        where,
        orderBy: [{ id: 'asc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_setting.count({ where }),
    ])

    return NextResponse.json({
      data: settings.map(toSettingDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/settings failed', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = settingCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid setting payload', parsed.error.flatten())
    }

    const setting = await prisma.mo_setting.create({
      data: buildSettingCreateData(parsed.data),
    })

    return NextResponse.json({ data: toSettingDto(setting) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/settings failed', error)
    return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 })
  }
}
