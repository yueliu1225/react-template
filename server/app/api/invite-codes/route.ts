import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { inviteCodeCreateSchema, inviteCodeQuerySchema } from './inviteCode.schema'
import { buildInviteCodeCreateData, toInviteCodeDto } from '@/lib/inviteCodes'

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
    const parsed = inviteCodeQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, uid, code, includeDeleted } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_invite_codeWhereInput = {}

    if (!includeDeleted) where.delete_time = null
    if (uid !== undefined) where.uid = uid
    if (code !== undefined) where.code = { contains: code }

    const [codes, total] = await Promise.all([
      prisma.mo_invite_code.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_invite_code.count({ where }),
    ])

    return NextResponse.json({
      data: codes.map(toInviteCodeDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/invite-codes failed', error)
    return NextResponse.json({ error: 'Failed to fetch invite codes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = inviteCodeCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid invite code payload', parsed.error.flatten())
    }

    const inviteCode = await prisma.mo_invite_code.create({
      data: buildInviteCodeCreateData(parsed.data),
    })

    return NextResponse.json({ data: toInviteCodeDto(inviteCode) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/invite-codes failed', error)
    return NextResponse.json({ error: 'Failed to create invite code' }, { status: 500 })
  }
}
