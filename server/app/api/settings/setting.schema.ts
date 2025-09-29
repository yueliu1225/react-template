import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

export const settingCreateSchema = z.object({
  title: z.string().trim().min(1).max(255),
  titleEn: z.string().trim().min(1).max(255),
  keywords: z.string().trim().min(1).max(255),
  keywordsEn: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(255),
  descriptionEn: z.string().trim().min(1).max(255),
  logo: z.string().trim().min(1).max(255),
  logo2: z.string().trim().min(1).max(255),
  favicon: z.string().trim().min(1).max(255),
  footer: z.any().optional(),
  smtp: z.any().optional(),
  i18n: z.string().trim().optional(),
})

export const settingUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    titleEn: z.string().trim().min(1).max(255).optional(),
    keywords: z.string().trim().min(1).max(255).optional(),
    keywordsEn: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().min(1).max(255).optional(),
    descriptionEn: z.string().trim().min(1).max(255).optional(),
    logo: z.string().trim().min(1).max(255).optional(),
    logo2: z.string().trim().min(1).max(255).optional(),
    favicon: z.string().trim().min(1).max(255).optional(),
    footer: z.any().optional(),
    smtp: z.any().optional(),
    i18n: z.string().trim().optional(),
  })
  .extend({ id: idSchema })

export const settingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).optional(),
})

export type SettingCreateInput = z.infer<typeof settingCreateSchema>
export type SettingUpdateInput = z.infer<typeof settingUpdateSchema>
export type SettingQuery = z.infer<typeof settingQuerySchema>

export type SettingDto = {
  id: number
  title: string
  titleEn: string
  keywords: string
  keywordsEn: string
  description: string
  descriptionEn: string
  logo: string
  logo2: string
  favicon: string
  footer: unknown
  smtp: unknown
  i18n: string | null
}
