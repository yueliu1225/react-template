import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { userUpdateSchema } from '../user.schema'
import { buildUserUpdateData, toUserDto } from '@/lib/users'

const parseId = (rawId: string) => {
  const id = Number(rawId)
  return Number.isFinite(id) && id > 0 ? id : null
}

type RouteContext = { params: Promise<Record<string, string | string[] | undefined>> }

const getIdParam = async (context: RouteContext) => {
  const params = await context.params
  const value = params?.id
  if (Array.isArray(value)) return value[0] ?? null
  return typeof value === 'string' ? value : null
}

export async function GET(_request: Request, context: RouteContext) {
  const idParam = await getIdParam(context)
  if (!idParam) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
  }

  try {
    const id = parseId(idParam)
    if (!id) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
    }

    const user = await prisma.mo_user.findUnique({
      where: { id },
    })

    if (!user || user.delete_time) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ data: toUserDto(user) })
  } catch (error) {
    console.error('GET /api/users/:id failed', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const idParam = await getIdParam(context)
  if (!idParam) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
  }

  const id = parseId(idParam)
  if (!id) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
  }

  try {
    const payload = await request.json()
    const parsed = userUpdateSchema.safeParse({ ...payload, id })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid user payload', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const data = buildUserUpdateData(parsed.data)

    const { update_time, ...rest } = data
    if (Object.keys(rest).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
    }

    const updated = await prisma.mo_user.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: toUserDto(updated) })
  } catch (error: any) {
    console.error('PUT /api/users/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const idParam = await getIdParam(context)
  if (!idParam) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
  }

  const id = parseId(idParam)
  if (!id) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
  }

  try {
    const url = new URL(request.url)
    const hardDelete = url.searchParams.get('hard') === 'true'

    if (hardDelete) {
      await prisma.mo_user.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    const deleted = await prisma.mo_user.update({
      where: { id },
      data: {
        delete_time: new Date(),
        update_time: new Date(),
      },
    })

    return NextResponse.json({ data: toUserDto(deleted) })
  } catch (error: any) {
    console.error('DELETE /api/users/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
