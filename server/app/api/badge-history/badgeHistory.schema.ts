import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

const optionalDateInput = z
  .union([
    z
      .string()
      .trim()
      .min(1)
      .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date-time value'),
    z.coerce.date().transform((value) => value.toISOString()),
    z.null(),
  ])
  .optional()

export const badgeHistoryCreateSchema = z.object({
  userId: idSchema.optional(),
  badgeId: idSchema.optional(),
  createTime: optionalDateInput,
})

export const badgeHistoryUpdateSchema = badgeHistoryCreateSchema.partial().extend({
  id: idSchema,
})

export const badgeHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  userId: idSchema.optional(),
  badgeId: idSchema.optional(),
})

export type BadgeHistoryCreateInput = z.infer<typeof badgeHistoryCreateSchema>
export type BadgeHistoryUpdateInput = z.infer<typeof badgeHistoryUpdateSchema>
export type BadgeHistoryQuery = z.infer<typeof badgeHistoryQuerySchema>

export type BadgeHistoryDto = {
  id: number
  userId: number | null
  badgeId: number | null
  createTime: string | null
}
