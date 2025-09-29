import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { noticeUpdateSchema } from '../notice.schema'
import { buildNoticeUpdateData, toNoticeDto } from '@/lib/notices'

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
    if (!idParam) return badRequest('Invalid notice id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid notice id')

    const notice = await prisma.mo_notice.findUnique({ where: { id } })

    if (!notice || notice.delete_time) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    }

    return NextResponse.json({ data: toNoticeDto(notice) })
  } catch (error) {
    console.error('GET /api/notices/:id failed', error)
    return NextResponse.json({ error: 'Failed to fetch notice' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid notice id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid notice id')

    const payload = await request.json()
    const parsed = noticeUpdateSchema.safeParse({ ...payload, id })
    if (!parsed.success) {
      return badRequest('Invalid notice payload', parsed.error.flatten())
    }

    const data = buildNoticeUpdateData(parsed.data)

    const { update_time: _ignored, ...rest } = data
    if (Object.keys(rest).length === 0) {
      return badRequest('No updatable fields provided')
    }

    const updated = await prisma.mo_notice.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: toNoticeDto(updated) })
  } catch (error: any) {
    console.error('PUT /api/notices/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update notice' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid notice id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid notice id')

    const url = new URL(request.url)
    const hardDelete = url.searchParams.get('hard') === 'true'

    if (hardDelete) {
      await prisma.mo_notice.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    const deleted = await prisma.mo_notice.update({
      where: { id },
      data: {
        delete_time: new Date(),
        update_time: new Date(),
      },
    })

    return NextResponse.json({ data: toNoticeDto(deleted) })
  } catch (error: any) {
    console.error('DELETE /api/notices/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 })
  }
}
