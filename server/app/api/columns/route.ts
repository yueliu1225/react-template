import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  columnCreateSchema,
  columnQuerySchema,
} from './column.schema'
import {
  buildColumnCreateData,
  toColumnDto,
} from '@/lib/columns'

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
    const parsed = columnQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, uid, search, includeDeleted } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_columnWhereInput = {}

    if (!includeDeleted) {
      where.delete_time = null
    }

    if (uid !== undefined) {
      where.uid = uid
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
      ]
    }

    const [columns, total] = await Promise.all([
      prisma.mo_column.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_column.count({ where }),
    ])

    return NextResponse.json({
      data: columns.map(toColumnDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/columns failed', error)
    return NextResponse.json({ error: 'Failed to fetch columns' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = columnCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid column payload', parsed.error.flatten())
    }

    const column = await prisma.mo_column.create({
      data: buildColumnCreateData(parsed.data),
    })

    return NextResponse.json({ data: toColumnDto(column) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/columns failed', error)
    return NextResponse.json({ error: 'Failed to create column' }, { status: 500 })
  }
}
