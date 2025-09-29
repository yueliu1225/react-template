import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { articleCreateSchema, articleQuerySchema } from './article.schema'
import { buildArticleCreateData, toArticleDto, toBooleanState } from '@/lib/articles'

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
    const parsed = articleQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, columnId, state, search, includeDeleted } = parsed.data
    const skip = (page - 1) * pageSize

    const where: any = {}

    if (!includeDeleted) {
      where.delete_time = null
    }

    if (columnId !== undefined) {
      where.column_id = columnId
    }

    const normalizedState = toBooleanState(state)
    if (normalizedState !== undefined) {
      where.state = normalizedState
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
      ]
    }

    const [articles, total] = await Promise.all([
      prisma.mo_article.findMany({
        where,
        orderBy: [
          { publish_time: 'desc' },
          { create_time: 'desc' },
        ],
        skip,
        take: pageSize,
      }),
      prisma.mo_article.count({ where }),
    ])

    return NextResponse.json({
      data: articles.map(toArticleDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/articles failed', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = articleCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid article payload', parsed.error.flatten())
    }

    const article = await prisma.mo_article.create({
      data: buildArticleCreateData(parsed.data),
    })

    return NextResponse.json({ data: toArticleDto(article) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/articles failed', error)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}
