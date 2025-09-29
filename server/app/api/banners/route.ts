import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { bannerCreateSchema, bannerQuerySchema } from './banner.schema'
import { buildBannerCreateData, toBannerDto } from '@/lib/banners'
import { toBooleanState } from '@/lib/articles'

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
    const parsed = bannerQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, isVisible, search, includeDeleted } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_bannerWhereInput = {}

    if (!includeDeleted) {
      where.delete_time = null
    }

    const normalizedVisibility = toBooleanState(isVisible)
    if (normalizedVisibility !== undefined) {
      where.is_visible = normalizedVisibility
    }

    if (search) {
      where.OR = [
        { image: { contains: search } },
        { link_url: { contains: search } },
      ]
    }

    const [banners, total] = await Promise.all([
      prisma.mo_banner.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_banner.count({ where }),
    ])

    return NextResponse.json({
      data: banners.map(toBannerDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/banners failed', error)
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = bannerCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid banner payload', parsed.error.flatten())
    }

    const banner = await prisma.mo_banner.create({
      data: buildBannerCreateData(parsed.data),
    })

    return NextResponse.json({ data: toBannerDto(banner) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/banners failed', error)
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
  }
}
