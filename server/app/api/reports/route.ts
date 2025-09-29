import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { reportCreateSchema, reportQuerySchema } from './report.schema'
import { buildReportCreateData, toReportDto, toReportStateInt } from '@/lib/reports'

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
    const parsed = reportQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, uid, type, typeId, category, state, includeDeleted, search } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_reportWhereInput = {}

    if (!includeDeleted) where.delete_time = null
    if (uid !== undefined) where.uid = uid
    if (type !== undefined) where.type = type
    if (typeId !== undefined) where.type_id = typeId
    if (category !== undefined) where.category = category
    if (state !== undefined) where.state = toReportStateInt(state)

    if (search) {
      where.summary = { contains: search }
    }

    const [reports, total] = await Promise.all([
      prisma.mo_report.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_report.count({ where }),
    ])

    return NextResponse.json({
      data: reports.map(toReportDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/reports failed', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = reportCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid report payload', parsed.error.flatten())
    }

    const report = await prisma.mo_report.create({
      data: buildReportCreateData(parsed.data),
    })

    return NextResponse.json({ data: toReportDto(report) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/reports failed', error)
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}
