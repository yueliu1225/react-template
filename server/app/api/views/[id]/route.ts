import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { viewUpdateSchema } from '../view.schema'
import { buildViewUpdateData, toViewDto } from '@/lib/views'

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
    if (!idParam) return badRequest('Invalid view id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid view id')

    const view = await prisma.mo_views.findUnique({ where: { id } })

    if (!view || view.delete_time) {
      return NextResponse.json({ error: 'View record not found' }, { status: 404 })
    }

    return NextResponse.json({ data: toViewDto(view) })
  } catch (error) {
    console.error('GET /api/views/:id failed', error)
    return NextResponse.json({ error: 'Failed to fetch view record' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid view id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid view id')

    const payload = await request.json()
    const parsed = viewUpdateSchema.safeParse({ ...payload, id })
    if (!parsed.success) {
      return badRequest('Invalid view payload', parsed.error.flatten())
    }

    const data = buildViewUpdateData(parsed.data)

    if (Object.keys(data).length === 0) {
      return badRequest('No updatable fields provided')
    }

    const updated = await prisma.mo_views.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: toViewDto(updated) })
  } catch (error: any) {
    console.error('PUT /api/views/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'View record not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update view record' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid view id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid view id')

    const url = new URL(request.url)
    const hardDelete = url.searchParams.get('hard') === 'true'

    if (hardDelete) {
      await prisma.mo_views.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    const deleted = await prisma.mo_views.update({
      where: { id },
      data: {
        delete_time: new Date(),
      },
    })

    return NextResponse.json({ data: toViewDto(deleted) })
  } catch (error: any) {
    console.error('DELETE /api/views/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'View record not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete view record' }, { status: 500 })
  }
}
