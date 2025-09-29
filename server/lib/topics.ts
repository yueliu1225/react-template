import { Prisma } from '@prisma/client'
import type {
  TopicCreateInput,
  TopicUpdateInput,
  TopicDto,
} from '@/app/api/topics/topic.schema'
import { toBooleanState } from './articles'

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

const normalizeTags = (tags: unknown): string[] | null => {
  if (!tags) return null
  if (Array.isArray(tags)) {
    const filtered = tags.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    return filtered.length > 0 ? filtered : null
  }
  if (typeof tags === 'string' && tags.trim().length > 0) {
    return [tags]
  }
  return null
}

export const buildTopicCreateData = (
  input: TopicCreateInput,
): Prisma.mo_topicCreateInput => {
  const now = new Date()
  const normalizedState = toBooleanState(input.state) ?? false

  return {
    uid: input.uid ?? 0,
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
    publish_time: toDateOrNull(input.publishTime),
    attachments: sanitizeJson(input.attachments ?? null),
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildTopicUpdateData = (
  input: TopicUpdateInput,
): Prisma.mo_topicUpdateInput => {
  const data: Prisma.mo_topicUpdateInput = {
    update_time: new Date(),
  }

  if (input.uid !== undefined) data.uid = input.uid ?? 0
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
  if (input.publishTime !== undefined) data.publish_time = toDateOrNull(input.publishTime)
  if (input.attachments !== undefined) data.attachments = sanitizeJson(input.attachments ?? null)

  return data
}

export const toTopicDto = (topic: Record<string, any>): TopicDto => ({
  id: topic.id,
  uid: topic.uid ?? null,
  title: topic.title,
  summary: topic.summary ?? null,
  tags: normalizeTags(topic.tags),
  content: topic.content ?? null,
  views: topic.views ?? 0,
  praises: topic.praises ?? 0,
  collects: topic.collects ?? 0,
  comments: topic.comments ?? 0,
  state: Boolean(topic.state),
  topTime: serializeDate(topic.top_time),
  publishTime: serializeDate(topic.publish_time),
  createTime: serializeDate(topic.create_time),
  updateTime: serializeDate(topic.update_time),
  deleteTime: serializeDate(topic.delete_time),
  attachments: topic.attachments ?? null,
})
