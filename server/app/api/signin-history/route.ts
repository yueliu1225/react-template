import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  signinHistoryCreateSchema,
  signinHistoryQuerySchema,
} from './signinHistory.schema'
import {
  buildSigninHistoryCreateData,
  toSigninHistoryDto,
} from '@/lib/signinHistory'

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
    const parsed = signinHistoryQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, uid, includeDeleted } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_signin_historyWhereInput = {}

    if (!includeDeleted) where.delete_time = null
    if (uid !== undefined) where.uid = uid

    const [entries, total] = await Promise.all([
      prisma.mo_signin_history.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_signin_history.count({ where }),
    ])

    return NextResponse.json({
      data: entries.map(toSigninHistoryDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/signin-history failed', error)
    return NextResponse.json({ error: 'Failed to fetch signin history' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = signinHistoryCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid signin history payload', parsed.error.flatten())
    }

    const entry = await prisma.mo_signin_history.create({
      data: buildSigninHistoryCreateData(parsed.data),
    })

    return NextResponse.json({ data: toSigninHistoryDto(entry) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/signin-history failed', error)
    return NextResponse.json({ error: 'Failed to create signin history entry' }, { status: 500 })
  }
}
