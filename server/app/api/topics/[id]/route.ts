import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { topicUpdateSchema } from '../topic.schema'
import { buildTopicUpdateData, toTopicDto } from '@/lib/topics'

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
    if (!idParam) return badRequest('Invalid topic id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid topic id')

    const topic = await prisma.mo_topic.findUnique({ where: { id } })

    if (!topic || topic.delete_time) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    return NextResponse.json({ data: toTopicDto(topic) })
  } catch (error) {
    console.error('GET /api/topics/:id failed', error)
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid topic id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid topic id')

    const payload = await request.json()
    const parsed = topicUpdateSchema.safeParse(payload)
    if (!parsed.success) {
      return badRequest('Invalid topic payload', parsed.error.flatten())
    }

    const data = buildTopicUpdateData(parsed.data)

    const { update_time: _ignored, ...rest } = data
    if (Object.keys(rest).length === 0) {
      return badRequest('No updatable fields provided')
    }

    const updated = await prisma.mo_topic.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: toTopicDto(updated) })
  } catch (error: any) {
    console.error('PUT /api/topics/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid topic id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid topic id')

    const url = new URL(request.url)
    const hardDelete = url.searchParams.get('hard') === 'true'

    if (hardDelete) {
      await prisma.mo_topic.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    const deleted = await prisma.mo_topic.update({
      where: { id },
      data: {
        delete_time: new Date(),
        update_time: new Date(),
      },
    })

    return NextResponse.json({ data: toTopicDto(deleted) })
  } catch (error: any) {
    console.error('DELETE /api/topics/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 })
  }
}
