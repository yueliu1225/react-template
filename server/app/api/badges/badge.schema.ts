import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

export const badgeCreateSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1).max(255),
})

export const badgeUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
  })
  .extend({ id: idSchema })

export const badgeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(255).optional(),
})

export type BadgeCreateInput = z.infer<typeof badgeCreateSchema>
export type BadgeUpdateInput = z.infer<typeof badgeUpdateSchema>
export type BadgeQuery = z.infer<typeof badgeQuerySchema>

export type BadgeDto = {
  id: number
  name: string
}
