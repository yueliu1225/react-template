import { Prisma } from '@prisma/client'
import type {
  SettingCreateInput,
  SettingUpdateInput,
  SettingDto,
} from '@/app/api/settings/setting.schema'

const sanitizeJson = (
  value: unknown,
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined => {
  if (value === undefined) return undefined
  if (value === null) return Prisma.JsonNull
  return value as Prisma.InputJsonValue
}

export const buildSettingCreateData = (
  input: SettingCreateInput,
): Prisma.mo_settingCreateInput => ({
  title: input.title,
  title_en: input.titleEn,
  keywords: input.keywords,
  keywords_en: input.keywordsEn,
  description: input.description,
  description_en: input.descriptionEn,
  logo: input.logo,
  logo2: input.logo2,
  favicon: input.favicon,
  footer: sanitizeJson(input.footer ?? null),
  smtp: sanitizeJson(input.smtp ?? null),
  i18n: input.i18n ?? null,
})

export const buildSettingUpdateData = (
  input: SettingUpdateInput,
): Prisma.mo_settingUpdateInput => {
  const data: Prisma.mo_settingUpdateInput = {}

  if (input.title !== undefined) data.title = input.title
  if (input.titleEn !== undefined) data.title_en = input.titleEn
  if (input.keywords !== undefined) data.keywords = input.keywords
  if (input.keywordsEn !== undefined) data.keywords_en = input.keywordsEn
  if (input.description !== undefined) data.description = input.description
  if (input.descriptionEn !== undefined) data.description_en = input.descriptionEn
  if (input.logo !== undefined) data.logo = input.logo
  if (input.logo2 !== undefined) data.logo2 = input.logo2
  if (input.favicon !== undefined) data.favicon = input.favicon
  if (input.footer !== undefined) data.footer = sanitizeJson(input.footer ?? null)
  if (input.smtp !== undefined) data.smtp = sanitizeJson(input.smtp ?? null)
  if (input.i18n !== undefined) data.i18n = input.i18n ?? null

  return data
}

export const toSettingDto = (setting: Record<string, any>): SettingDto => ({
  id: setting.id,
  title: setting.title,
  titleEn: setting.title_en,
  keywords: setting.keywords,
  keywordsEn: setting.keywords_en,
  description: setting.description,
  descriptionEn: setting.description_en,
  logo: setting.logo,
  logo2: setting.logo2,
  favicon: setting.favicon,
  footer: setting.footer ?? null,
  smtp: setting.smtp ?? null,
  i18n: setting.i18n ?? null,
})
