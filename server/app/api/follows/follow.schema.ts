import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

export const followCreateSchema = z.object({
  uid: idSchema,
  typeId: idSchema,
})

export const followUpdateSchema = z
  .object({
    uid: idSchema.optional(),
    typeId: idSchema.optional(),
  })
  .extend({ id: idSchema })

export const followQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  uid: idSchema.optional(),
  typeId: idSchema.optional(),
  includeDeleted: z.coerce.boolean().optional(),
})

export type FollowCreateInput = z.infer<typeof followCreateSchema>
export type FollowUpdateInput = z.infer<typeof followUpdateSchema>
export type FollowQuery = z.infer<typeof followQuerySchema>

export type FollowDto = {
  id: number
  uid: number
  typeId: number
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
