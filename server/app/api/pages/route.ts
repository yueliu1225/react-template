import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { pageCreateSchema, pageQuerySchema } from './page.schema'
import { buildPageCreateData, toPageDto } from '@/lib/pages'
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
    const parsed = pageQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, url: pageUrl, isNav, isShow, includeDeleted, search } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_pageWhereInput = {}

    if (!includeDeleted) where.delete_time = null
    if (pageUrl !== undefined) where.url = pageUrl

    const normalizedIsNav = toBooleanState(isNav)
    if (normalizedIsNav !== undefined) where.is_nav = normalizedIsNav

    const normalizedIsShow = toBooleanState(isShow)
    if (normalizedIsShow !== undefined) where.is_show = normalizedIsShow

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { url: { contains: search } },
      ]
    }

    const [pages, total] = await Promise.all([
      prisma.mo_page.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_page.count({ where }),
    ])

    return NextResponse.json({
      data: pages.map(toPageDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/pages failed', error)
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = pageCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid page payload', parsed.error.flatten())
    }

    const page = await prisma.mo_page.create({
      data: buildPageCreateData(parsed.data),
    })

    return NextResponse.json({ data: toPageDto(page) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/pages failed', error)
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}
