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

export const pageCreateSchema = z.object({
  url: z.string().trim().min(1).max(255),
  title: z.string().trim().min(1).max(255),
  isNav: booleanLikeSchema,
  isShow: booleanLikeSchema,
  content: z.any().optional(),
})

export const pageUpdateSchema = z
  .object({
    url: z.string().trim().min(1).max(255).optional(),
    title: z.string().trim().min(1).max(255).optional(),
    isNav: booleanLikeSchema,
    isShow: booleanLikeSchema,
    content: z.any().optional(),
  })
  .extend({ id: idSchema })

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  url: z.string().trim().min(1).max(255).optional(),
  isNav: booleanLikeSchema,
  isShow: booleanLikeSchema,
  includeDeleted: z.coerce.boolean().optional(),
  search: z.string().trim().min(1).optional(),
})

export type PageCreateInput = z.infer<typeof pageCreateSchema>
export type PageUpdateInput = z.infer<typeof pageUpdateSchema>
export type PageQuery = z.infer<typeof pageQuerySchema>

export type PageDto = {
  id: number
  url: string
  title: string
  isNav: boolean
  isShow: boolean
  content: unknown
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
