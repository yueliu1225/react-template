import type { Prisma } from '@prisma/client'
import type { BadgeCreateInput, BadgeUpdateInput, BadgeDto } from '@/app/api/badges/badge.schema'

export const buildBadgeCreateData = (
  input: BadgeCreateInput,
): Prisma.mo_badgeCreateInput => ({
  id: input.id,
  name: input.name,
})

export const buildBadgeUpdateData = (
  input: BadgeUpdateInput,
): Prisma.mo_badgeUpdateInput => {
  const data: Prisma.mo_badgeUpdateInput = {}
  if (input.name !== undefined) data.name = input.name
  return data
}

export const toBadgeDto = (badge: Record<string, any>): BadgeDto => ({
  id: badge.id,
  name: badge.name,
})
