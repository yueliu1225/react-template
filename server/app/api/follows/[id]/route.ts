import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { followUpdateSchema } from '../follow.schema'
import { buildFollowUpdateData, toFollowDto } from '@/lib/follows'

const parseId = (rawId: string) => {
  const id = Number(rawId)
  return Number.isFinite(id) && id > 0 ? id : null
}

const badRequest = (message: string, details?: unknown) =>
  NextResponse.json({ error: message, details }, { status: 400 })

type RouteContext = { params: Promise<Record<string, string | string[] | undefined>> }

const getIdParam = async (context: RouteContext) => {
  const params = await context.params
  const value = params?.id
  if (Array.isArray(value)) return value[0] ?? null
  return typeof value === 'string' ? value : null
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid follow id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid follow id')

    const follow = await prisma.mo_follow.findUnique({ where: { id } })

    if (!follow || follow.delete_time) {
      return NextResponse.json({ error: 'Follow not found' }, { status: 404 })
    }

    return NextResponse.json({ data: toFollowDto(follow) })
  } catch (error) {
    console.error('GET /api/follows/:id failed', error)
    return NextResponse.json({ error: 'Failed to fetch follow' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid follow id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid follow id')

    const payload = await request.json()
    const parsed = followUpdateSchema.safeParse({ ...payload, id })
    if (!parsed.success) {
      return badRequest('Invalid follow payload', parsed.error.flatten())
    }

    const data = buildFollowUpdateData(parsed.data)

    const { update_time: _ignored, ...rest } = data
    if (Object.keys(rest).length === 0) {
      return badRequest('No updatable fields provided')
    }

    const updated = await prisma.mo_follow.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: toFollowDto(updated) })
  } catch (error: any) {
    console.error('PUT /api/follows/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Follow not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update follow' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid follow id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid follow id')

    const url = new URL(request.url)
    const hardDelete = url.searchParams.get('hard') === 'true'

    if (hardDelete) {
      await prisma.mo_follow.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    const deleted = await prisma.mo_follow.update({
      where: { id },
      data: {
        delete_time: new Date(),
        update_time: new Date(),
      },
    })

    return NextResponse.json({ data: toFollowDto(deleted) })
  } catch (error: any) {
    console.error('DELETE /api/follows/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Follow not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete follow' }, { status: 500 })
  }
}
