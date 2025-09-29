import { z } from 'zod'
import { articleStateSchema } from '../articles/article.schema'

const idSchema = z.coerce.number().int().positive()

const tagsSchema = z
  .array(z.string().trim().min(1).max(50))
  .max(20)
  .optional()

const attachmentsSchema = z
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
        (value) => Object.values(value).some((entry) => entry !== undefined),
        'Attachment entries must include at least one populated property',
      ),
  )
  .optional()

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

export const topicCreateSchema = z.object({
  uid: idSchema.optional(),
  title: z.string().trim().min(1).max(255),
  summary: z.string().trim().max(2000).optional(),
  tags: tagsSchema.or(z.null()).optional(),
  content: z.string().min(1, 'Content is required'),
  views: z.coerce.number().int().min(0).optional(),
  praises: z.coerce.number().int().min(0).optional(),
  collects: z.coerce.number().int().min(0).optional(),
  comments: z.coerce.number().int().min(0).optional(),
  state: articleStateSchema,
  topTime: optionalDateInput,
  publishTime: optionalDateInput,
  attachments: attachmentsSchema.or(z.null()).optional(),
})

export const topicUpdateSchema = topicCreateSchema.partial().extend({
  id: idSchema.optional(),
})

export const topicQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  uid: idSchema.optional(),
  state: articleStateSchema,
  search: z.string().trim().min(1).max(255).optional(),
  includeDeleted: z.coerce.boolean().optional(),
})

export type TopicCreateInput = z.infer<typeof topicCreateSchema>
export type TopicUpdateInput = z.infer<typeof topicUpdateSchema>
export type TopicQuery = z.infer<typeof topicQuerySchema>

export type TopicDto = {
  id: number
  uid: number | null
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
  publishTime: string | null
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
  attachments: unknown
}
