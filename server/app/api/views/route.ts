import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { viewCreateSchema, viewQuerySchema } from './view.schema'
import { buildViewCreateData, toViewDto } from '@/lib/views'

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
    const parsed = viewQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, uid, contentType, contentId, includeDeleted } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_viewsWhereInput = {}

    if (!includeDeleted) where.delete_time = null
    if (uid !== undefined) where.uid = uid
    if (contentType !== undefined) where.content_type = contentType
    if (contentId !== undefined) where.content_id = contentId

    const [views, total] = await Promise.all([
      prisma.mo_views.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_views.count({ where }),
    ])

    return NextResponse.json({
      data: views.map(toViewDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/views failed', error)
    return NextResponse.json({ error: 'Failed to fetch views' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = viewCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid view payload', parsed.error.flatten())
    }

    const view = await prisma.mo_views.create({
      data: buildViewCreateData(parsed.data),
    })

    return NextResponse.json({ data: toViewDto(view) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/views failed', error)
    return NextResponse.json({ error: 'Failed to create view' }, { status: 500 })
  }
}
