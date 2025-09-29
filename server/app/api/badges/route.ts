import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { badgeCreateSchema, badgeQuerySchema } from './badge.schema'
import { buildBadgeCreateData, toBadgeDto } from '@/lib/badges'

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
    const parsed = badgeQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, search } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_badgeWhereInput = {}

    if (search) {
      where.name = { contains: search }
    }

    const [badges, total] = await Promise.all([
      prisma.mo_badge.findMany({
        where,
        orderBy: [{ id: 'asc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_badge.count({ where }),
    ])

    return NextResponse.json({
      data: badges.map(toBadgeDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/badges failed', error)
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = badgeCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid badge payload', parsed.error.flatten())
    }

    const badge = await prisma.mo_badge.create({
      data: buildBadgeCreateData(parsed.data),
    })

    return NextResponse.json({ data: toBadgeDto(badge) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/badges failed', error)
    return NextResponse.json({ error: 'Failed to create badge' }, { status: 500 })
  }
}
