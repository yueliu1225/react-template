import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

const optionalDateInput = z
  .union([
    z
      .string()
      .trim()
      .min(1)
      .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date-time value'),
    z.coerce.date().transform((value) => value.toISOString()),
    z.null(),
  ])
  .optional()

export const vcodeCreateSchema = z.object({
  account: z.string().trim().max(255).optional(),
  code: z.string().trim().min(1).max(255),
  ip: z.string().trim().max(255).optional(),
  createTime: optionalDateInput,
  updateTime: optionalDateInput,
})

export const vcodeUpdateSchema = z
  .object({
    account: z.string().trim().max(255).optional(),
    code: z.string().trim().min(1).max(255).optional(),
    ip: z.string().trim().max(255).optional(),
    createTime: optionalDateInput,
    updateTime: optionalDateInput,
  })
  .extend({ id: idSchema })

export const vcodeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  account: z.string().trim().max(255).optional(),
  ip: z.string().trim().max(255).optional(),
  includeDeleted: z.coerce.boolean().optional(),
})

export type VcodeCreateInput = z.infer<typeof vcodeCreateSchema>
export type VcodeUpdateInput = z.infer<typeof vcodeUpdateSchema>
export type VcodeQuery = z.infer<typeof vcodeQuerySchema>

export type VcodeDto = {
  id: number
  account: string | null
  code: string
  ip: string | null
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
