import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { noticeCreateSchema, noticeQuerySchema } from './notice.schema'
import { buildNoticeCreateData, toNoticeDto } from '@/lib/notices'
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
    const parsed = noticeQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, uid, sendUid, isNew, includeDeleted, search } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_noticeWhereInput = {}

    if (!includeDeleted) where.delete_time = null
    if (uid !== undefined) where.uid = uid
    if (sendUid !== undefined) where.send_uid = sendUid

    const normalizedIsNew = toBooleanState(isNew)
    if (normalizedIsNew !== undefined) where.is_new = normalizedIsNew

    if (search) {
      where.OR = [
        { category: { contains: search } },
        { content: { contains: search } },
      ]
    }

    const [notices, total] = await Promise.all([
      prisma.mo_notice.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_notice.count({ where }),
    ])

    return NextResponse.json({
      data: notices.map(toNoticeDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/notices failed', error)
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = noticeCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid notice payload', parsed.error.flatten())
    }

    const notice = await prisma.mo_notice.create({
      data: buildNoticeCreateData(parsed.data),
    })

    return NextResponse.json({ data: toNoticeDto(notice) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/notices failed', error)
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 })
  }
}
