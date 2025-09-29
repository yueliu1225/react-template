import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { praiseCreateSchema, praiseQuerySchema } from './praise.schema'
import { buildPraiseCreateData, toPraiseDto } from '@/lib/praises'

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
    const parsed = praiseQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, uid, type, typeId, includeDeleted } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_praiseWhereInput = {}

    if (!includeDeleted) where.delete_time = null
    if (uid !== undefined) where.uid = uid
    if (type !== undefined) where.type = type
    if (typeId !== undefined) where.type_id = typeId

    const [praises, total] = await Promise.all([
      prisma.mo_praise.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_praise.count({ where }),
    ])

    return NextResponse.json({
      data: praises.map(toPraiseDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/praises failed', error)
    return NextResponse.json({ error: 'Failed to fetch praises' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = praiseCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid praise payload', parsed.error.flatten())
    }

    const praise = await prisma.mo_praise.create({
      data: buildPraiseCreateData(parsed.data),
    })

    return NextResponse.json({ data: toPraiseDto(praise) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/praises failed', error)
    return NextResponse.json({ error: 'Failed to create praise' }, { status: 500 })
  }
}
