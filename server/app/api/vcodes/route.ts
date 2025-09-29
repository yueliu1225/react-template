import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { vcodeCreateSchema, vcodeQuerySchema } from './vcode.schema'
import { buildVcodeCreateData, toVcodeDto } from '@/lib/vcodes'

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
    const parsed = vcodeQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, account, ip, includeDeleted } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_vcodeWhereInput = {}

    if (!includeDeleted) where.delete_time = null
    if (account !== undefined) where.account = account
    if (ip !== undefined) where.ip = { contains: ip }

    const [vcodes, total] = await Promise.all([
      prisma.mo_vcode.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_vcode.count({ where }),
    ])

    return NextResponse.json({
      data: vcodes.map(toVcodeDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/vcodes failed', error)
    return NextResponse.json({ error: 'Failed to fetch verification codes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = vcodeCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid verification code payload', parsed.error.flatten())
    }

    const vcode = await prisma.mo_vcode.create({
      data: buildVcodeCreateData(parsed.data),
    })

    return NextResponse.json({ data: toVcodeDto(vcode) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/vcodes failed', error)
    return NextResponse.json({ error: 'Failed to create verification code' }, { status: 500 })
  }
}
