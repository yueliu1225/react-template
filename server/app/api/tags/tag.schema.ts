import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

const booleanLikeSchema = z
  .union([
    z.boolean(),
    z.coerce
      .number()
      .int()
      .refine((value) => value === 0 || value === 1, 'Boolean-like values must be 0 or 1 when numeric'),
  ])
  .optional()

export const tagCreateSchema = z.object({
  title: z.string().trim().min(1).max(255),
  isTop: booleanLikeSchema,
})

export const tagUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    isTop: booleanLikeSchema,
  })
  .extend({ id: idSchema })

export const tagQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  isTop: booleanLikeSchema,
  includeDeleted: z.coerce.boolean().optional(),
  search: z.string().trim().min(1).optional(),
})

export type TagCreateInput = z.infer<typeof tagCreateSchema>
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>
export type TagQuery = z.infer<typeof tagQuerySchema>

export type TagDto = {
  id: number
  title: string
  isTop: boolean
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
