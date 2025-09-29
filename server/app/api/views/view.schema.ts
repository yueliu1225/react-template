import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

export const viewCreateSchema = z.object({
  uid: idSchema.optional(),
  contentType: z.string().trim().min(1).max(255),
  contentId: idSchema,
})

export const viewUpdateSchema = z
  .object({
    uid: idSchema.optional(),
    contentType: z.string().trim().min(1).max(255).optional(),
    contentId: idSchema.optional(),
  })
  .extend({ id: idSchema })

export const viewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  uid: idSchema.optional(),
  contentType: z.string().trim().min(1).max(255).optional(),
  contentId: idSchema.optional(),
  includeDeleted: z.coerce.boolean().optional(),
})

export type ViewCreateInput = z.infer<typeof viewCreateSchema>
export type ViewUpdateInput = z.infer<typeof viewUpdateSchema>
export type ViewQuery = z.infer<typeof viewQuerySchema>

export type ViewDto = {
  id: number
  uid: number | null
  contentType: string
  contentId: number | null
  createTime: string | null
  deleteTime: string | null
}
