import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

const booleanLikeSchema = z.union([
  z.boolean(),
  z.coerce
    .number()
    .int()
    .refine((value) => value === 0 || value === 1, 'Boolean-like values must be 0 or 1 when numeric'),
]).optional()

export const collectCreateSchema = z.object({
  uid: idSchema,
  type: z.string().trim().min(1).max(255),
  typeId: idSchema,
  title: z.string().trim().min(1).max(255),
  isValid: booleanLikeSchema,
})

export const collectUpdateSchema = z
  .object({
    type: z.string().trim().min(1).max(255).optional(),
    typeId: idSchema.optional(),
    title: z.string().trim().min(1).max(255).optional(),
    isValid: booleanLikeSchema,
  })
  .extend({ id: idSchema })

export const collectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  uid: idSchema.optional(),
  type: z.string().trim().min(1).max(255).optional(),
  typeId: idSchema.optional(),
  isValid: booleanLikeSchema,
  includeDeleted: z.coerce.boolean().optional(),
})

export type CollectCreateInput = z.infer<typeof collectCreateSchema>
export type CollectUpdateInput = z.infer<typeof collectUpdateSchema>
export type CollectQuery = z.infer<typeof collectQuerySchema>

export type CollectDto = {
  id: number
  uid: number
  type: string
  typeId: number
  title: string
  isValid: boolean
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
