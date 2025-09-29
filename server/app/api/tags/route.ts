import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { tagCreateSchema, tagQuerySchema } from './tag.schema'
import { buildTagCreateData, toTagDto } from '@/lib/tags'
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
    const parsed = tagQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, isTop, includeDeleted, search } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_tagsWhereInput = {}

    if (!includeDeleted) where.delete_time = null

    const normalizedIsTop = toBooleanState(isTop)
    if (normalizedIsTop !== undefined) where.is_top = normalizedIsTop

    if (search) {
      where.title = { contains: search }
    }

    const [tags, total] = await Promise.all([
      prisma.mo_tags.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_tags.count({ where }),
    ])

    return NextResponse.json({
      data: tags.map(toTagDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/tags failed', error)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = tagCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid tag payload', parsed.error.flatten())
    }

    const tag = await prisma.mo_tags.create({
      data: buildTagCreateData(parsed.data),
    })

    return NextResponse.json({ data: toTagDto(tag) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/tags failed', error)
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}
