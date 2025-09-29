import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { collectCreateSchema, collectQuerySchema } from './collect.schema'
import { buildCollectCreateData, toCollectDto } from '@/lib/collects'
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
    const parsed = collectQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, uid, type, typeId, isValid, includeDeleted } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_collectWhereInput = {}

    if (!includeDeleted) {
      where.delete_time = null
    }

    if (uid !== undefined) {
      where.uid = uid
    }

    if (type !== undefined) {
      where.type = type
    }

    if (typeId !== undefined) {
      where.type_id = typeId
    }

    const normalizedValidity = toBooleanState(isValid)
    if (normalizedValidity !== undefined) {
      where.is_valid = normalizedValidity
    }

    const [collects, total] = await Promise.all([
      prisma.mo_collect.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_collect.count({ where }),
    ])

    return NextResponse.json({
      data: collects.map(toCollectDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/collects failed', error)
    return NextResponse.json({ error: 'Failed to fetch collects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = collectCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid collect payload', parsed.error.flatten())
    }

    const collect = await prisma.mo_collect.create({
      data: buildCollectCreateData(parsed.data),
    })

    return NextResponse.json({ data: toCollectDto(collect) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/collects failed', error)
    return NextResponse.json({ error: 'Failed to create collect' }, { status: 500 })
  }
}
