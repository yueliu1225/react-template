import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { collectUpdateSchema } from '../collect.schema'
import { buildCollectUpdateData, toCollectDto } from '@/lib/collects'

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
    if (!idParam) return badRequest('Invalid collect id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid collect id')

    const collect = await prisma.mo_collect.findUnique({ where: { id } })

    if (!collect || collect.delete_time) {
      return NextResponse.json({ error: 'Collect not found' }, { status: 404 })
    }

    return NextResponse.json({ data: toCollectDto(collect) })
  } catch (error) {
    console.error('GET /api/collects/:id failed', error)
    return NextResponse.json({ error: 'Failed to fetch collect' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid collect id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid collect id')

    const payload = await request.json()
    const parsed = collectUpdateSchema.safeParse({ ...payload, id })
    if (!parsed.success) {
      return badRequest('Invalid collect payload', parsed.error.flatten())
    }

    const data = buildCollectUpdateData(parsed.data)

    const { update_time: _ignored, ...rest } = data
    if (Object.keys(rest).length === 0) {
      return badRequest('No updatable fields provided')
    }

    const updated = await prisma.mo_collect.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: toCollectDto(updated) })
  } catch (error: any) {
    console.error('PUT /api/collects/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Collect not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update collect' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid collect id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid collect id')

    const url = new URL(request.url)
    const hardDelete = url.searchParams.get('hard') === 'true'

    if (hardDelete) {
      await prisma.mo_collect.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    const deleted = await prisma.mo_collect.update({
      where: { id },
      data: {
        delete_time: new Date(),
        update_time: new Date(),
      },
    })

    return NextResponse.json({ data: toCollectDto(deleted) })
  } catch (error: any) {
    console.error('DELETE /api/collects/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Collect not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete collect' }, { status: 500 })
  }
}
