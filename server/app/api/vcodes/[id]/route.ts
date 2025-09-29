import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { vcodeUpdateSchema } from '../vcode.schema'
import { buildVcodeUpdateData, toVcodeDto } from '@/lib/vcodes'

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
    if (!idParam) return badRequest('Invalid verification code id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid verification code id')

    const vcode = await prisma.mo_vcode.findUnique({ where: { id } })

    if (!vcode || vcode.delete_time) {
      return NextResponse.json({ error: 'Verification code not found' }, { status: 404 })
    }

    return NextResponse.json({ data: toVcodeDto(vcode) })
  } catch (error) {
    console.error('GET /api/vcodes/:id failed', error)
    return NextResponse.json({ error: 'Failed to fetch verification code' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid verification code id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid verification code id')

    const payload = await request.json()
    const parsed = vcodeUpdateSchema.safeParse({ ...payload, id })
    if (!parsed.success) {
      return badRequest('Invalid verification code payload', parsed.error.flatten())
    }

    const data = buildVcodeUpdateData(parsed.data)

    if (Object.keys(data).length === 0) {
      return badRequest('No updatable fields provided')
    }

    const updated = await prisma.mo_vcode.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: toVcodeDto(updated) })
  } catch (error: any) {
    console.error('PUT /api/vcodes/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Verification code not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update verification code' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid verification code id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid verification code id')

    const url = new URL(request.url)
    const hardDelete = url.searchParams.get('hard') === 'true'

    if (hardDelete) {
      await prisma.mo_vcode.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    const deleted = await prisma.mo_vcode.update({
      where: { id },
      data: {
        delete_time: new Date(),
      },
    })

    return NextResponse.json({ data: toVcodeDto(deleted) })
  } catch (error: any) {
    console.error('DELETE /api/vcodes/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Verification code not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete verification code' }, { status: 500 })
  }
}
