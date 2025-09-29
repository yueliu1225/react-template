import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { badgeUpdateSchema } from '../badge.schema'
import { buildBadgeUpdateData, toBadgeDto } from '@/lib/badges'

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
    if (!idParam) return badRequest('Invalid badge id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid badge id')

    const badge = await prisma.mo_badge.findUnique({ where: { id } })

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 })
    }

    return NextResponse.json({ data: toBadgeDto(badge) })
  } catch (error) {
    console.error('GET /api/badges/:id failed', error)
    return NextResponse.json({ error: 'Failed to fetch badge' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid badge id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid badge id')

    const payload = await request.json()
    const parsed = badgeUpdateSchema.safeParse({ ...payload, id })
    if (!parsed.success) {
      return badRequest('Invalid badge payload', parsed.error.flatten())
    }

    const data = buildBadgeUpdateData(parsed.data)

    if (Object.keys(data).length === 0) {
      return badRequest('No updatable fields provided')
    }

    const updated = await prisma.mo_badge.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: toBadgeDto(updated) })
  } catch (error: any) {
    console.error('PUT /api/badges/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update badge' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid badge id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid badge id')

    await prisma.mo_badge.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/badges/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete badge' }, { status: 500 })
  }
}
