import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

const booleanLikeSchema = z.union([
  z.boolean(),
  z.coerce
    .number()
    .int()
    .refine((value) => value === 0 || value === 1, 'Boolean-like values must be 0 or 1 when numeric'),
]).optional()

export const bannerCreateSchema = z.object({
  image: z.string().trim().min(1).max(255),
  linkUrl: z.string().trim().max(255).optional(),
  isVisible: booleanLikeSchema,
})

export const bannerUpdateSchema = z
  .object({
    image: z.string().trim().min(1).max(255).optional(),
    linkUrl: z.string().trim().max(255).optional(),
    isVisible: booleanLikeSchema,
  })
  .extend({ id: idSchema })

export const bannerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  isVisible: booleanLikeSchema,
  search: z.string().trim().min(1).max(255).optional(),
  includeDeleted: z.coerce.boolean().optional(),
})

export type BannerCreateInput = z.infer<typeof bannerCreateSchema>
export type BannerUpdateInput = z.infer<typeof bannerUpdateSchema>
export type BannerQuery = z.infer<typeof bannerQuerySchema>

export type BannerDto = {
  id: number
  image: string
  linkUrl: string | null
  isVisible: boolean
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
