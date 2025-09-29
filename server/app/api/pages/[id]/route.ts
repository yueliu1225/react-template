import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pageUpdateSchema } from '../page.schema'
import { buildPageUpdateData, toPageDto } from '@/lib/pages'

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
    if (!idParam) return badRequest('Invalid page id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid page id')

    const page = await prisma.mo_page.findUnique({ where: { id } })

    if (!page || page.delete_time) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json({ data: toPageDto(page) })
  } catch (error) {
    console.error('GET /api/pages/:id failed', error)
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid page id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid page id')

    const payload = await request.json()
    const parsed = pageUpdateSchema.safeParse({ ...payload, id })
    if (!parsed.success) {
      return badRequest('Invalid page payload', parsed.error.flatten())
    }

    const data = buildPageUpdateData(parsed.data)

    const { update_time: _ignored, ...rest } = data
    if (Object.keys(rest).length === 0) {
      return badRequest('No updatable fields provided')
    }

    const updated = await prisma.mo_page.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: toPageDto(updated) })
  } catch (error: any) {
    console.error('PUT /api/pages/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid page id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid page id')

    const url = new URL(request.url)
    const hardDelete = url.searchParams.get('hard') === 'true'

    if (hardDelete) {
      await prisma.mo_page.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    const deleted = await prisma.mo_page.update({
      where: { id },
      data: {
        delete_time: new Date(),
        update_time: new Date(),
      },
    })

    return NextResponse.json({ data: toPageDto(deleted) })
  } catch (error: any) {
    console.error('DELETE /api/pages/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
