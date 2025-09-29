import type { Prisma } from '@prisma/client'
import type { LogCreateInput, LogUpdateInput, LogDto } from '@/app/api/logs/log.schema'
import { toBooleanState } from '@/lib/articles'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

const normalizeBooleanInt = (value: unknown, fallback = false): number =>
  (toBooleanState(value) ?? fallback) ? 1 : 0

export const buildLogCreateData = (
  input: LogCreateInput,
): Prisma.mo_logCreateInput => {
  const now = new Date()

  return {
    uid: input.uid,
    type: input.type,
    content: input.content ?? null,
    success: normalizeBooleanInt(input.success, false),
    ip: input.ip ?? '',
    manage: toBooleanState(input.manage) ?? false,
    create_time: now,
    delete_time: null,
  }
}

export const buildLogUpdateData = (
  input: LogUpdateInput,
): Prisma.mo_logUpdateInput => {
  const data: Prisma.mo_logUpdateInput = {}

  if (input.uid !== undefined) data.uid = input.uid
  if (input.type !== undefined) data.type = input.type
  if (input.content !== undefined) data.content = input.content ?? null
  if (input.success !== undefined) data.success = normalizeBooleanInt(input.success)
  if (input.ip !== undefined) data.ip = input.ip ?? ''
  if (input.manage !== undefined) data.manage = toBooleanState(input.manage) ?? false

  return data
}

export const toLogDto = (log: Record<string, any>): LogDto => ({
  id: log.id,
  uid: log.uid,
  type: log.type,
  content: log.content ?? null,
  success: Boolean(log.success),
  ip: log.ip ?? null,
  manage: Boolean(log.manage),
  createTime: serializeDate(log.create_time),
  deleteTime: serializeDate(log.delete_time),
})
