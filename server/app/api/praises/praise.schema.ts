import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

export const praiseCreateSchema = z.object({
  uid: idSchema,
  type: z.string().trim().min(1).max(255),
  typeId: idSchema,
})

export const praiseUpdateSchema = z
  .object({
    uid: idSchema.optional(),
    type: z.string().trim().min(1).max(255).optional(),
    typeId: idSchema.optional(),
  })
  .extend({ id: idSchema })

export const praiseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  uid: idSchema.optional(),
  type: z.string().trim().min(1).max(255).optional(),
  typeId: idSchema.optional(),
  includeDeleted: z.coerce.boolean().optional(),
})

export type PraiseCreateInput = z.infer<typeof praiseCreateSchema>
export type PraiseUpdateInput = z.infer<typeof praiseUpdateSchema>
export type PraiseQuery = z.infer<typeof praiseQuerySchema>

export type PraiseDto = {
  id: number
  uid: number
  type: string
  typeId: number
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
