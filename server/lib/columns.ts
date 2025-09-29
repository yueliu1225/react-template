import type { Prisma } from '@prisma/client'
import type {
  ColumnCreateInput,
  ColumnUpdateInput,
  ColumnDto,
} from '@/app/api/columns/column.schema'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export const buildColumnCreateData = (
  input: ColumnCreateInput,
): Prisma.mo_columnCreateInput => {
  const now = new Date()

  return {
    uid: input.uid,
    title: input.title,
    summary: input.summary ?? null,
    thumbnail: input.thumbnail ?? '',
    collects: input.collects ?? 0,
    articles: input.articles ?? 0,
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildColumnUpdateData = (
  input: ColumnUpdateInput,
): Prisma.mo_columnUpdateInput => {
  const data: Prisma.mo_columnUpdateInput = {
    update_time: new Date(),
  }

  if (input.uid !== undefined) data.uid = input.uid
  if (input.title !== undefined) data.title = input.title
  if (input.summary !== undefined) data.summary = input.summary ?? null
  if (input.thumbnail !== undefined) data.thumbnail = input.thumbnail ?? ''
  if (input.collects !== undefined) data.collects = input.collects
  if (input.articles !== undefined) data.articles = input.articles

  return data
}

export const toColumnDto = (column: Record<string, any>): ColumnDto => ({
  id: column.id,
  uid: column.uid,
  title: column.title,
  summary: column.summary ?? null,
  thumbnail: column.thumbnail ?? null,
  collects: column.collects ?? 0,
  articles: column.articles ?? 0,
  createTime: serializeDate(column.create_time),
  updateTime: serializeDate(column.update_time),
  deleteTime: serializeDate(column.delete_time),
})
