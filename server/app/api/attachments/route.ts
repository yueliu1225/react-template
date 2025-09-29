import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  attachmentCreateSchema,
  attachmentQuerySchema,
} from './attachment.schema'
import {
  buildAttachmentCreateData,
  toAttachmentDto,
} from '@/lib/attachments'

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
    const parsed = attachmentQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return badRequest('Invalid query parameters', parsed.error.flatten())
    }

    const { page, pageSize, uid, parentId, includeDeleted, search } = parsed.data
    const skip = (page - 1) * pageSize

    const where: Prisma.mo_attachmentsWhereInput = {}

    if (!includeDeleted) {
      where.delete_time = null
    }

    if (uid !== undefined) {
      where.uid = uid
    }

    if (parentId !== undefined) {
      where.parent_id = parentId
    }

    if (search) {
      where.OR = [
        { file: { contains: search } },
        { file_name: { contains: search } },
        { file_extension: { contains: search } },
      ]
    }

    const [attachments, total] = await Promise.all([
      prisma.mo_attachments.findMany({
        where,
        orderBy: [{ create_time: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.mo_attachments.count({ where }),
    ])

    return NextResponse.json({
      data: attachments.map(toAttachmentDto),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('GET /api/attachments failed', error)
    return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = attachmentCreateSchema.safeParse(payload)

    if (!parsed.success) {
      return badRequest('Invalid attachment payload', parsed.error.flatten())
    }

    const attachment = await prisma.mo_attachments.create({
      data: buildAttachmentCreateData(parsed.data),
    })

    return NextResponse.json({ data: toAttachmentDto(attachment) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/attachments failed', error)
    return NextResponse.json({ error: 'Failed to create attachment' }, { status: 500 })
  }
}
