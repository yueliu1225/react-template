import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { topicCreateSchema, topicQuerySchema } from './topic.schema'
import { buildTopicCreateData, toTopicDto } from '@/lib/topics'
import { toBooleanState } from '@/lib/articles'

type ErrorPayload = {
  error: string
  details?: unknown
}

const badRequest = (message: string, details?: unknown) =>
  NextResponse.json<ErrorPayload>({ error: message, details }, { status: 400 })

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const rawParams = Object.fromEntries(url.searchParams.entries())
    const parsed = topicQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, uid, state, search, includeDeleted } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_topicWhereInput = {}

    if (!includeDeleted) {
      where.delete_time = null
    }

    if (uid !== undefined) {
      where.uid = uid
    }

    const normalizedState = toBooleanState(state)
    if (normalizedState !== undefined) {
      where.state = normalizedState
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
      ]
    }

    const [topics, total] = await Promise.all([
      prisma.mo_topic.findMany({
        where,
        orderBy: [
          { publish_time: 'desc' },
          { create_time: 'desc' },
        ],
        skip,
        take: pageSize,
      }),
      prisma.mo_topic.count({ where }),
    ])

    return NextResponse.json({
      data: topics.map(toTopicDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/topics failed', error)
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = topicCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid topic payload', parsed.error.flatten())
    }

    const topic = await prisma.mo_topic.create({
      data: buildTopicCreateData(parsed.data),
    })

    return NextResponse.json({ data: toTopicDto(topic) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/topics failed', error)
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 })
  }
}
