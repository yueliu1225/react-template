import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  userCreateSchema,
  userQuerySchema,
} from './user.schema'
import {
  buildUserCreateData,
  toUserDto,
  toStateInt,
} from '@/lib/users'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const rawParams = Object.fromEntries(url.searchParams.entries())
    const parsed = userQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { page, pageSize, email, mobile, state, includeDeleted, search } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_userWhereInput = {}

    if (!includeDeleted) where.delete_time = null
    if (email) where.email = email
    if (mobile) where.mobile = mobile
    if (state !== undefined) where.state = toStateInt(state)

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { nickname: { contains: search } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.mo_user.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_user.count({ where }),
    ])

    return NextResponse.json({
      data: users.map(toUserDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    })
  } catch (error) {
    console.error('GET /api/users failed', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = userCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid user payload', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const user = await prisma.mo_user.create({
      data: buildUserCreateData(parsed.data),
    })

    return NextResponse.json({ data: toUserDto(user) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/users failed', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
