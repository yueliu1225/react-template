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

export const noticeCreateSchema = z.object({
  uid: idSchema,
  category: z.string().trim().max(20).optional(),
  content: z.string().trim().optional(),
  sendUid: idSchema,
  isNew: booleanLikeSchema,
})

export const noticeUpdateSchema = z
  .object({
    uid: idSchema.optional(),
    category: z.string().trim().max(20).optional(),
    content: z.string().trim().optional(),
    sendUid: idSchema.optional(),
    isNew: booleanLikeSchema,
  })
  .extend({ id: idSchema })

export const noticeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  uid: idSchema.optional(),
  sendUid: idSchema.optional(),
  isNew: booleanLikeSchema,
  includeDeleted: z.coerce.boolean().optional(),
  search: z.string().trim().min(1).optional(),
})

export type NoticeCreateInput = z.infer<typeof noticeCreateSchema>
export type NoticeUpdateInput = z.infer<typeof noticeUpdateSchema>
export type NoticeQuery = z.infer<typeof noticeQuerySchema>

export type NoticeDto = {
  id: number
  uid: number
  category: string | null
  content: string | null
  sendUid: number
  isNew: boolean
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
