import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { articleUpdateSchema } from '../article.schema'
import { buildArticleUpdateData, toArticleDto } from '@/lib/articles'

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
    if (!idParam) return badRequest('Invalid article id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid article id')

    const article = await prisma.mo_article.findUnique({ where: { id } })

    if (!article || article.delete_time) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json({ data: toArticleDto(article) })
  } catch (error) {
    console.error('GET /api/articles/:id failed', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid article id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid article id')

    const payload = await request.json()
    const parsed = articleUpdateSchema.safeParse(payload)
    if (!parsed.success) {
      return badRequest('Invalid article payload', parsed.error.flatten())
    }

    const data = buildArticleUpdateData(parsed.data)

    const { update_time: _ignored, ...rest } = data
    if (Object.keys(rest).length === 0) {
      return badRequest('No updatable fields provided')
    }

    const updated = await prisma.mo_article.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: toArticleDto(updated) })
  } catch (error: any) {
    console.error('PUT /api/articles/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const idParam = await getIdParam(context)
    if (!idParam) return badRequest('Invalid article id')

    const id = parseId(idParam)
    if (!id) return badRequest('Invalid article id')

    const url = new URL(request.url)
    const hardDelete = url.searchParams.get('hard') === 'true'

    if (hardDelete) {
      await prisma.mo_article.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    const deleted = await prisma.mo_article.update({
      where: { id },
      data: {
        delete_time: new Date(),
        update_time: new Date(),
      },
    })

    return NextResponse.json({ data: toArticleDto(deleted) })
  } catch (error: any) {
    console.error('DELETE /api/articles/:id failed', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
