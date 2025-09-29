import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  columnRequestCreateSchema,
  columnRequestQuerySchema,
} from './columnRequest.schema'
import {
  buildColumnRequestCreateData,
  toColumnRequestDto,
  toStateInt as toColumnRequestStateInt,
} from '@/lib/columnRequests'

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
    const parsed = columnRequestQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, uid, state, includeDeleted, search } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_column_requestWhereInput = {}

    if (!includeDeleted) {
      where.delete_time = null
    }

    if (uid !== undefined) {
      where.uid = uid
    }

    if (state !== undefined) {
      where.state = toColumnRequestStateInt(state)
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
      ]
    }

    const [requests, total] = await Promise.all([
      prisma.mo_column_request.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_column_request.count({ where }),
    ])

    return NextResponse.json({
      data: requests.map(toColumnRequestDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/column-requests failed', error)
    return NextResponse.json({ error: 'Failed to fetch column requests' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = columnRequestCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid column request payload', parsed.error.flatten())
    }

    const columnRequest = await prisma.mo_column_request.create({
      data: buildColumnRequestCreateData(parsed.data),
    })

    return NextResponse.json({ data: toColumnRequestDto(columnRequest) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/column-requests failed', error)
    return NextResponse.json({ error: 'Failed to create column request' }, { status: 500 })
  }
}
