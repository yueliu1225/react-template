import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

const stateEnumSchema = z.union([
  z.literal('pending'),
  z.literal('approved'),
  z.literal('rejected'),
])

const numericStateSchema = z
  .coerce
  .number()
  .int()
  .refine((value) => value === -1 || value === 0 || value === 1, 'State must be -1, 0, or 1 when numeric')

export const columnRequestStateSchema = z.union([stateEnumSchema, numericStateSchema]).optional()

export const columnRequestCreateSchema = z.object({
  uid: idSchema,
  title: z.string().trim().min(1).max(255),
  thumbnail: z.string().trim().max(255).optional(),
  summary: z.string().trim().max(4000).optional(),
  state: columnRequestStateSchema,
})

export const columnRequestUpdateSchema = columnRequestCreateSchema.partial().extend({
  id: idSchema.optional(),
})

export const columnRequestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  uid: idSchema.optional(),
  state: columnRequestStateSchema,
  includeDeleted: z.coerce.boolean().optional(),
  search: z.string().trim().min(1).max(255).optional(),
})

export type ColumnRequestCreateInput = z.infer<typeof columnRequestCreateSchema>
export type ColumnRequestUpdateInput = z.infer<typeof columnRequestUpdateSchema>
export type ColumnRequestQuery = z.infer<typeof columnRequestQuerySchema>

export type ColumnRequestState = 'pending' | 'approved' | 'rejected'

export type ColumnRequestDto = {
  id: number
  uid: number
  title: string
  thumbnail: string | null
  summary: string | null
  state: ColumnRequestState
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
