import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  badgeHistoryCreateSchema,
  badgeHistoryQuerySchema,
} from './badgeHistory.schema'
import {
  buildBadgeHistoryCreateData,
  toBadgeHistoryDto,
} from '@/lib/badgeHistory'

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
    const parsed = badgeHistoryQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, userId, badgeId } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_badge_historyWhereInput = {}

    if (userId !== undefined) {
      where.user_id = userId
    }

    if (badgeId !== undefined) {
      where.badge_id = badgeId
    }

    const [entries, total] = await Promise.all([
      prisma.mo_badge_history.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_badge_history.count({ where }),
    ])

    return NextResponse.json({
      data: entries.map(toBadgeHistoryDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/badge-history failed', error)
    return NextResponse.json({ error: 'Failed to fetch badge history' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = badgeHistoryCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid badge history payload', parsed.error.flatten())
    }

    const entry = await prisma.mo_badge_history.create({
      data: buildBadgeHistoryCreateData(parsed.data),
    })

    return NextResponse.json({ data: toBadgeHistoryDto(entry) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/badge-history failed', error)
    return NextResponse.json({ error: 'Failed to create badge history entry' }, { status: 500 })
  }
}
