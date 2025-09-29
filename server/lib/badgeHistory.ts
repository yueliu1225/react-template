import type { Prisma } from '@prisma/client'
import type {
  BadgeHistoryCreateInput,
  BadgeHistoryUpdateInput,
  BadgeHistoryDto,
} from '@/app/api/badge-history/badgeHistory.schema'

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

export const buildBadgeHistoryCreateData = (
  input: BadgeHistoryCreateInput,
): Prisma.mo_badge_historyCreateInput => ({
  user_id: input.userId ?? null,
  badge_id: input.badgeId ?? null,
  create_time: toDateOrNull(input.createTime),
})

export const buildBadgeHistoryUpdateData = (
  input: BadgeHistoryUpdateInput,
): Prisma.mo_badge_historyUpdateInput => {
  const data: Prisma.mo_badge_historyUpdateInput = {}
  if (input.userId !== undefined) data.user_id = input.userId ?? null
  if (input.badgeId !== undefined) data.badge_id = input.badgeId ?? null
  if (input.createTime !== undefined) data.create_time = toDateOrNull(input.createTime)
  return data
}

export const toBadgeHistoryDto = (entry: Record<string, any>): BadgeHistoryDto => ({
  id: entry.id,
  userId: entry.user_id ?? null,
  badgeId: entry.badge_id ?? null,
  createTime: serializeDate(entry.create_time),
})
