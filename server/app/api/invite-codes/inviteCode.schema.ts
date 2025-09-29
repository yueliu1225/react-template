import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

export const inviteCodeCreateSchema = z.object({
  uid: idSchema,
  code: z.string().trim().min(1).max(255),
  contact: z.string().trim().max(255).optional(),
})

export const inviteCodeUpdateSchema = z
  .object({
    uid: idSchema.optional(),
    code: z.string().trim().min(1).max(255).optional(),
    contact: z.string().trim().max(255).optional(),
  })
  .extend({ id: idSchema })

export const inviteCodeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  uid: idSchema.optional(),
  code: z.string().trim().min(1).max(255).optional(),
  includeDeleted: z.coerce.boolean().optional(),
})

export type InviteCodeCreateInput = z.infer<typeof inviteCodeCreateSchema>
export type InviteCodeUpdateInput = z.infer<typeof inviteCodeUpdateSchema>
export type InviteCodeQuery = z.infer<typeof inviteCodeQuerySchema>

export type InviteCodeDto = {
  id: number
  uid: number
  code: string
  contact: string | null
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
