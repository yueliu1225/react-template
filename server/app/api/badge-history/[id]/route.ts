import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { badgeHistoryUpdateSchema } from '../badgeHistory.schema'
import {
  buildBadgeHistoryUpdateData,
  toBadgeHistoryDto,
} from '@/lib/badgeHistory'

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
    if (!idParam) return badRequest('Invalid badge history id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid badge history id')

    const entry = await prisma.mo_badge_history.findUnique({ where: { id } })

    if (!entry) {
      return NextResponse.json({ error: 'Badge history entry not found' }, { status: 404 })
    }

    return NextResponse.json({ data: toBadgeHistoryDto(entry) })
  } catch (error) {
    console.error('GET /api/badge-history/:id failed', error)
    return NextResponse.json({ error: 'Failed to fetch badge history entry' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid badge history id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid badge history id')

    const payload = await request.json()
    const parsed = badgeHistoryUpdateSchema.safeParse({ ...payload, id })
    if (!parsed.success) {
      return badRequest('Invalid badge history payload', parsed.error.flatten())
    }

    const data = buildBadgeHistoryUpdateData(parsed.data)

    if (Object.keys(data).length === 0) {
      return badRequest('No updatable fields provided')
    }

    const updated = await prisma.mo_badge_history.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: toBadgeHistoryDto(updated) })
  } catch (error: any) {
    console.error('PUT /api/badge-history/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Badge history entry not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update badge history entry' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid badge history id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid badge history id')

    await prisma.mo_badge_history.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/badge-history/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Badge history entry not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete badge history entry' }, { status: 500 })
  }
}
