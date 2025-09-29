import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signinHistoryUpdateSchema } from '../signinHistory.schema'
import {
  buildSigninHistoryUpdateData,
  toSigninHistoryDto,
} from '@/lib/signinHistory'

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
    if (!idParam) return badRequest('Invalid signin history id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid signin history id')

    const entry = await prisma.mo_signin_history.findUnique({ where: { id } })

    if (!entry || entry.delete_time) {
      return NextResponse.json({ error: 'Signin history entry not found' }, { status: 404 })
    }

    return NextResponse.json({ data: toSigninHistoryDto(entry) })
  } catch (error) {
    console.error('GET /api/signin-history/:id failed', error)
    return NextResponse.json({ error: 'Failed to fetch signin history entry' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid signin history id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid signin history id')

    const payload = await request.json()
    const parsed = signinHistoryUpdateSchema.safeParse({ ...payload, id })
    if (!parsed.success) {
      return badRequest('Invalid signin history payload', parsed.error.flatten())
    }

    const data = buildSigninHistoryUpdateData(parsed.data)

    if (Object.keys(data).length === 0) {
      return badRequest('No updatable fields provided')
    }

    const updated = await prisma.mo_signin_history.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: toSigninHistoryDto(updated) })
  } catch (error: any) {
    console.error('PUT /api/signin-history/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Signin history entry not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update signin history entry' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid signin history id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid signin history id')

    const url = new URL(request.url)
    const hardDelete = url.searchParams.get('hard') === 'true'

    if (hardDelete) {
      await prisma.mo_signin_history.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    const deleted = await prisma.mo_signin_history.update({
      where: { id },
      data: {
        delete_time: new Date(),
      },
    })

    return NextResponse.json({ data: toSigninHistoryDto(deleted) })
  } catch (error: any) {
    console.error('DELETE /api/signin-history/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Signin history entry not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete signin history entry' }, { status: 500 })
  }
}
