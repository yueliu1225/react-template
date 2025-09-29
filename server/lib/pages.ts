import { Prisma } from '@prisma/client'
import type { PageCreateInput, PageUpdateInput, PageDto } from '@/app/api/pages/page.schema'
import { toBooleanState } from '@/lib/articles'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

const sanitizeJson = (
  value: unknown,
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined => {
  if (value === undefined) return undefined
  if (value === null) return Prisma.JsonNull
  return value as Prisma.InputJsonValue
}

export const buildPageCreateData = (
  input: PageCreateInput,
): Prisma.mo_pageCreateInput => {
  const now = new Date()

  return {
    url: input.url,
    title: input.title,
    is_nav: toBooleanState(input.isNav) ?? false,
    is_show: toBooleanState(input.isShow) ?? false,
    content: sanitizeJson(input.content ?? null),
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildPageUpdateData = (
  input: PageUpdateInput,
): Prisma.mo_pageUpdateInput => {
  const data: Prisma.mo_pageUpdateInput = {
    update_time: new Date(),
  }

  if (input.url !== undefined) data.url = input.url
  if (input.title !== undefined) data.title = input.title
  if (input.isNav !== undefined) data.is_nav = toBooleanState(input.isNav) ?? false
  if (input.isShow !== undefined) data.is_show = toBooleanState(input.isShow) ?? false
  if (input.content !== undefined) data.content = sanitizeJson(input.content ?? null)

  return data
}

export const toPageDto = (page: Record<string, any>): PageDto => ({
  id: page.id,
  url: page.url,
  title: page.title,
  isNav: Boolean(page.is_nav),
  isShow: Boolean(page.is_show),
  content: page.content ?? null,
  createTime: serializeDate(page.create_time),
  updateTime: serializeDate(page.update_time),
  deleteTime: serializeDate(page.delete_time),
})
