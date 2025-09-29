import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

export const attachmentCreateSchema = z.object({
  uid: idSchema.optional(),
  file: z.string().trim().min(1).max(255),
  fileName: z.string().trim().min(1).max(255),
  fileSize: z.string().trim().min(1).max(255),
  fileExtension: z.string().trim().min(1).max(255),
  parentId: idSchema.optional(),
})

export const attachmentUpdateSchema = z
  .object({
    uid: idSchema.optional(),
    file: z.string().trim().min(1).max(255).optional(),
    fileName: z.string().trim().min(1).max(255).optional(),
    fileSize: z.string().trim().min(1).max(255).optional(),
    fileExtension: z.string().trim().min(1).max(255).optional(),
    parentId: idSchema.optional(),
  })
  .extend({ id: idSchema.optional() })

export const attachmentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  uid: idSchema.optional(),
  parentId: idSchema.optional(),
  includeDeleted: z.coerce.boolean().optional(),
  search: z.string().trim().min(1).max(255).optional(),
})

export type AttachmentCreateInput = z.infer<typeof attachmentCreateSchema>
export type AttachmentUpdateInput = z.infer<typeof attachmentUpdateSchema>
export type AttachmentQuery = z.infer<typeof attachmentQuerySchema>

export type AttachmentDto = {
  id: number
  uid: number | null
  file: string | null
  fileName: string | null
  fileSize: string | null
  fileExtension: string | null
  parentId: number | null
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
