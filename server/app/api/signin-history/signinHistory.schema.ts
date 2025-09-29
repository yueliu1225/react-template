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

export const signinHistoryCreateSchema = z.object({
  uid: idSchema.optional(),
  createTime: optionalDateInput,
})

export const signinHistoryUpdateSchema = signinHistoryCreateSchema.partial().extend({
  id: idSchema,
})

export const signinHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  uid: idSchema.optional(),
  includeDeleted: z.coerce.boolean().optional(),
})

export type SigninHistoryCreateInput = z.infer<typeof signinHistoryCreateSchema>
export type SigninHistoryUpdateInput = z.infer<typeof signinHistoryUpdateSchema>
export type SigninHistoryQuery = z.infer<typeof signinHistoryQuerySchema>

export type SigninHistoryDto = {
  id: number
  uid: number | null
  createTime: string | null
  deleteTime: string | null
}
