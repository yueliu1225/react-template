import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { followCreateSchema, followQuerySchema } from './follow.schema'
import { buildFollowCreateData, toFollowDto } from '@/lib/follows'

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
    const parsed = followQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, uid, typeId, includeDeleted } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_followWhereInput = {}

    if (!includeDeleted) where.delete_time = null
    if (uid !== undefined) where.uid = uid
    if (typeId !== undefined) where.type_id = typeId

    const [follows, total] = await Promise.all([
      prisma.mo_follow.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_follow.count({ where }),
    ])

    return NextResponse.json({
      data: follows.map(toFollowDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/follows failed', error)
    return NextResponse.json({ error: 'Failed to fetch follows' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = followCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid follow payload', parsed.error.flatten())
    }

    const follow = await prisma.mo_follow.create({
      data: buildFollowCreateData(parsed.data),
    })

    return NextResponse.json({ data: toFollowDto(follow) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/follows failed', error)
    return NextResponse.json({ error: 'Failed to create follow' }, { status: 500 })
  }
}
