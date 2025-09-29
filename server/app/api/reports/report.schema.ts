import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

const stateStringSchema = z.union([
  z.literal('pending'),
  z.literal('approved'),
  z.literal('rejected'),
])

const stateNumberSchema = z
  .coerce
  .number()
  .int()
  .refine((value) => value === -1 || value === 0 || value === 1, 'State must be -1, 0, or 1 when numeric')

export const reportStateSchema = z.union([stateStringSchema, stateNumberSchema]).optional()

export const reportCreateSchema = z.object({
  uid: idSchema,
  type: z.string().trim().min(1).max(255),
  typeId: idSchema,
  category: z.coerce.number().int().min(0).optional(),
  summary: z.string().trim().optional(),
  state: reportStateSchema,
  typeData: z.any().optional(),
})

export const reportUpdateSchema = z
  .object({
    uid: idSchema.optional(),
    type: z.string().trim().min(1).max(255).optional(),
    typeId: idSchema.optional(),
    category: z.coerce.number().int().min(0).optional(),
    summary: z.string().trim().optional(),
    state: reportStateSchema,
    typeData: z.any().optional(),
  })
  .extend({ id: idSchema })

export const reportQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  uid: idSchema.optional(),
  type: z.string().trim().min(1).max(255).optional(),
  typeId: idSchema.optional(),
  category: z.coerce.number().int().min(0).optional(),
  state: reportStateSchema,
  includeDeleted: z.coerce.boolean().optional(),
  search: z.string().trim().min(1).optional(),
})

export type ReportCreateInput = z.infer<typeof reportCreateSchema>
export type ReportUpdateInput = z.infer<typeof reportUpdateSchema>
export type ReportQuery = z.infer<typeof reportQuerySchema>

export type ReportState = 'pending' | 'approved' | 'rejected'

export type ReportDto = {
  id: number
  uid: number
  type: string
  typeId: number
  category: number
  summary: string | null
  state: ReportState
  typeData: unknown
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
