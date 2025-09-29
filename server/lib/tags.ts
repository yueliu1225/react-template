import type { Prisma } from '@prisma/client'
import type {
  TagCreateInput,
  TagUpdateInput,
  TagDto,
} from '@/app/api/tags/tag.schema'
import { toBooleanState } from '@/lib/articles'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export const buildTagCreateData = (
  input: TagCreateInput,
): Prisma.mo_tagsCreateInput => {
  const now = new Date()

  return {
    title: input.title,
    is_top: toBooleanState(input.isTop) ?? false,
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildTagUpdateData = (
  input: TagUpdateInput,
): Prisma.mo_tagsUpdateInput => {
  const data: Prisma.mo_tagsUpdateInput = {
    update_time: new Date(),
  }

  if (input.title !== undefined) data.title = input.title
  if (input.isTop !== undefined) data.is_top = toBooleanState(input.isTop) ?? false

  return data
}

export const toTagDto = (tag: Record<string, any>): TagDto => ({
  id: tag.id,
  title: tag.title,
  isTop: Boolean(tag.is_top),
  createTime: serializeDate(tag.create_time),
  updateTime: serializeDate(tag.update_time),
  deleteTime: serializeDate(tag.delete_time),
})
