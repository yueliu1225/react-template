import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

const stringDateTime = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date-time value')
  .transform((value) => new Date(value).toISOString())

const optionalDateInput = z
  .union([
    stringDateTime,
    z.coerce.date().transform((value) => value.toISOString()),
    z.null(),
  ])
  .optional()

const counterSchema = z.coerce.number().int().min(0).optional()

const attachmentSchema = z
  .array(
    z
      .object({
        id: z.string().trim().optional(),
        url: z.string().url().optional(),
        name: z.string().trim().optional(),
        type: z.string().trim().optional(),
        size: z.coerce.number().int().nonnegative().optional(),
        meta: z.record(z.any()).optional(),
      })
      .refine(
        (val) => Object.values(val).some((entry) => entry !== undefined),
        'Attachment entries must contain at least one populated property',
      ),
  )
  .optional()

const tagsSchema = z
  .array(z.string().trim().min(1).max(50))
  .max(20)
  .optional()

const numericStateSchema = z
  .coerce
  .number()
  .int()
  .refine((value) => value === 0 || value === 1, 'State must be 0 or 1 when numeric')

export const articleStateSchema = z.union([numericStateSchema, z.boolean()]).optional()

export const articleCreateSchema = z.object({
  columnId: idSchema.optional(),
  title: z.string().trim().min(1).max(255),
  summary: z.string().trim().max(2000).optional(),
  tags: tagsSchema.or(z.null()).optional(),
  content: z.string().min(1, 'Content is required'),
  state: articleStateSchema,
  publishTime: optionalDateInput,
  topTime: optionalDateInput,
  authorTopTime: optionalDateInput,
  attachments: attachmentSchema.or(z.null()).optional(),
  views: counterSchema,
  praises: counterSchema,
  collects: counterSchema,
  comments: counterSchema,
})

export const articleUpdateSchema = articleCreateSchema.partial().extend({
  id: idSchema.optional(),
})

export const articleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  columnId: idSchema.optional(),
  state: z.union([z.literal(-1), z.literal(0), z.literal(1)]).optional(),
  search: z.string().trim().min(1).max(255).optional(),
  includeDeleted: z.coerce.boolean().optional(),
})

export type ArticleCreateInput = z.infer<typeof articleCreateSchema>
export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>
export type ArticleQuery = z.infer<typeof articleQuerySchema>

export type ArticleDto = {
  id: number
  columnId: number | null
  title: string
  summary: string | null
  tags: string[] | null
  content: string | null
  views: number
  praises: number
  collects: number
  comments: number
  state: boolean
  topTime: string | null
  authorTopTime: string | null
  publishTime: string | null
  createTime: string | null
  updateTime: string | null
  attachments: unknown
}
