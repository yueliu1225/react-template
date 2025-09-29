import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  managerRoleCreateSchema,
  managerRoleQuerySchema,
} from './managerRole.schema'
import {
  buildManagerRoleCreateData,
  toManagerRoleDto,
} from '@/lib/managerRoles'

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
    const parsed = managerRoleQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, search, includeDeleted } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_manager_roleWhereInput = {}

    if (!includeDeleted) where.delete_time = null
    if (search) {
      where.title = { contains: search }
    }

    const [roles, total] = await Promise.all([
      prisma.mo_manager_role.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_manager_role.count({ where }),
    ])

    return NextResponse.json({
      data: roles.map(toManagerRoleDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/manager-roles failed', error)
    return NextResponse.json({ error: 'Failed to fetch manager roles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = managerRoleCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid manager role payload', parsed.error.flatten())
    }

    const role = await prisma.mo_manager_role.create({
      data: buildManagerRoleCreateData(parsed.data),
    })

    return NextResponse.json({ data: toManagerRoleDto(role) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/manager-roles failed', error)
    return NextResponse.json({ error: 'Failed to create manager role' }, { status: 500 })
  }
}
