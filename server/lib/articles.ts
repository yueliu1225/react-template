import { Prisma } from '@prisma/client'
import type {
  ArticleCreateInput,
  ArticleUpdateInput,
  ArticleDto,
} from '@/app/api/articles/article.schema'

const toDateOrNull = (value: string | null | undefined): Date | null => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

const sanitizeJson = (
  value: unknown,
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined => {
  if (value === undefined) return undefined
  if (value === null) return Prisma.JsonNull
  return value as Prisma.InputJsonValue
}

export const toBooleanState = (value: unknown): boolean | undefined => {
  if (value === undefined) return undefined
  if (typeof value === 'boolean') return value
  return value === 1
}

export const buildArticleCreateData = (
  input: ArticleCreateInput,
): Prisma.mo_articleUncheckedCreateInput => {
  const now = new Date()
  const normalizedState = toBooleanState(input.state) ?? false

  return {
    column_id: input.columnId ?? 0,
    title: input.title,
    summary: input.summary ?? null,
    tags: sanitizeJson(input.tags ?? null),
    content: input.content,
    views: input.views ?? 0,
    praises: input.praises ?? 0,
    collects: input.collects ?? 0,
    comments: input.comments ?? 0,
    state: normalizedState,
    top_time: toDateOrNull(input.topTime),
    author_top_time: toDateOrNull(input.authorTopTime),
    publish_time: toDateOrNull(input.publishTime),
    attachments: sanitizeJson(input.attachments ?? null),
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildArticleUpdateData = (
  input: ArticleUpdateInput,
): Prisma.mo_articleUncheckedUpdateInput => {
  const data: Prisma.mo_articleUncheckedUpdateInput = {
    update_time: new Date(),
  }

  if (input.columnId !== undefined) data.column_id = input.columnId ?? 0
  if (input.title !== undefined) data.title = input.title
  if (input.summary !== undefined) data.summary = input.summary ?? null
  if (input.tags !== undefined) data.tags = sanitizeJson(input.tags ?? null)
  if (input.content !== undefined) data.content = input.content
  if (input.views !== undefined) data.views = input.views
  if (input.praises !== undefined) data.praises = input.praises
  if (input.collects !== undefined) data.collects = input.collects
  if (input.comments !== undefined) data.comments = input.comments
  const normalizedState = toBooleanState(input.state)
  if (normalizedState !== undefined) data.state = normalizedState
  if (input.topTime !== undefined) data.top_time = toDateOrNull(input.topTime)
  if (input.authorTopTime !== undefined)
    data.author_top_time = toDateOrNull(input.authorTopTime)
  if (input.publishTime !== undefined) data.publish_time = toDateOrNull(input.publishTime)
  if (input.attachments !== undefined) data.attachments = sanitizeJson(input.attachments ?? null)

  return data
}

export const toArticleDto = (article: Record<string, any>): ArticleDto => {
  const tags = article.tags
  let normalizedTags: string[] | null = null
  if (Array.isArray(tags)) {
    normalizedTags = tags.filter((tag): tag is string => typeof tag === 'string')
  } else if (typeof tags === 'string') {
    normalizedTags = [tags]
  }

  return {
    id: article.id,
    columnId: article.column_id ?? null,
    title: article.title,
    summary: article.summary ?? null,
    tags: normalizedTags,
    content: article.content ?? null,
    views: article.views ?? 0,
    praises: article.praises ?? 0,
    collects: article.collects ?? 0,
    comments: article.comments ?? 0,
    state: Boolean(article.state),
    topTime: serializeDate(article.top_time),
    authorTopTime: serializeDate(article.author_top_time),
    publishTime: serializeDate(article.publish_time),
    createTime: serializeDate(article.create_time),
    updateTime: serializeDate(article.update_time),
    attachments: article.attachments ?? null,
  }
}
