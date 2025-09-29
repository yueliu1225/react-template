import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { settingUpdateSchema } from '../setting.schema'
import { buildSettingUpdateData, toSettingDto } from '@/lib/settings'

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
    if (!idParam) return badRequest('Invalid setting id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid setting id')

    const setting = await prisma.mo_setting.findUnique({ where: { id } })

    if (!setting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    return NextResponse.json({ data: toSettingDto(setting) })
  } catch (error) {
    console.error('GET /api/settings/:id failed', error)
    return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid setting id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid setting id')

    const payload = await request.json()
    const parsed = settingUpdateSchema.safeParse({ ...payload, id })
    if (!parsed.success) {
      return badRequest('Invalid setting payload', parsed.error.flatten())
    }

    const data = buildSettingUpdateData(parsed.data)

    if (Object.keys(data).length === 0) {
      return badRequest('No updatable fields provided')
    }

    const updated = await prisma.mo_setting.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: toSettingDto(updated) })
  } catch (error: any) {
    console.error('PUT /api/settings/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid setting id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid setting id')

    await prisma.mo_setting.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/settings/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 })
  }
}
