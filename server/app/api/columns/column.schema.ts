import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

export const columnCreateSchema = z.object({
  uid: idSchema,
  title: z.string().trim().min(1).max(255),
  summary: z.string().trim().max(2000).optional(),
  thumbnail: z.string().trim().max(255).optional(),
  collects: z.coerce.number().int().min(0).optional(),
  articles: z.coerce.number().int().min(0).optional(),
})

export const columnUpdateSchema = columnCreateSchema.partial().extend({
  id: idSchema.optional(),
})

export const columnQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  uid: idSchema.optional(),
  search: z.string().trim().min(1).max(255).optional(),
  includeDeleted: z.coerce.boolean().optional(),
})

export type ColumnCreateInput = z.infer<typeof columnCreateSchema>
export type ColumnUpdateInput = z.infer<typeof columnUpdateSchema>
export type ColumnQuery = z.infer<typeof columnQuerySchema>

export type ColumnDto = {
  id: number
  uid: number
  title: string
  summary: string | null
  thumbnail: string | null
  collects: number
  articles: number
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
