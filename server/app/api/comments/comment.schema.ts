import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

const contentSchema = z.string().trim().min(1)

export const commentCreateSchema = z.object({
  uid: idSchema,
  type: z.string().trim().min(1).max(255),
  typeId: idSchema,
  commentId: idSchema,
  replyUid: idSchema,
  content: contentSchema,
  praises: z.coerce.number().int().min(0).optional(),
  ip: z.string().trim().max(200).optional(),
})

export const commentUpdateSchema = z
  .object({
    type: z.string().trim().min(1).max(255).optional(),
    typeId: idSchema.optional(),
    commentId: idSchema.optional(),
    replyUid: idSchema.optional(),
    content: contentSchema.optional(),
    praises: z.coerce.number().int().min(0).optional(),
    ip: z.string().trim().max(200).optional(),
  })
  .extend({ id: idSchema })

export const commentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  uid: idSchema.optional(),
  type: z.string().trim().min(1).max(255).optional(),
  typeId: idSchema.optional(),
  commentId: idSchema.optional(),
  includeDeleted: z.coerce.boolean().optional(),
  search: z.string().trim().min(1).optional(),
})

export type CommentCreateInput = z.infer<typeof commentCreateSchema>
export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>
export type CommentQuery = z.infer<typeof commentQuerySchema>

export type CommentDto = {
  id: number
  uid: number
  type: string
  typeId: number
  commentId: number
  replyUid: number
  content: string
  praises: number
  ip: string | null
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
