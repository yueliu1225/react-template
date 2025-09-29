import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { commentCreateSchema, commentQuerySchema } from './comment.schema'
import { buildCommentCreateData, toCommentDto } from '@/lib/comments'

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
    const parsed = commentQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, uid, type, typeId, commentId, includeDeleted, search } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_commentWhereInput = {}

    if (!includeDeleted) {
      where.delete_time = null
    }

    if (uid !== undefined) where.uid = uid
    if (type !== undefined) where.type = type
    if (typeId !== undefined) where.type_id = typeId
    if (commentId !== undefined) where.comment_id = commentId

    if (search) {
      where.OR = [
        { content: { contains: search } },
        { ip: { contains: search } },
      ]
    }

    const [comments, total] = await Promise.all([
      prisma.mo_comment.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_comment.count({ where }),
    ])

    return NextResponse.json({
      data: comments.map(toCommentDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/comments failed', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = commentCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid comment payload', parsed.error.flatten())
    }

    const comment = await prisma.mo_comment.create({
      data: buildCommentCreateData(parsed.data),
    })

    return NextResponse.json({ data: toCommentDto(comment) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/comments failed', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
