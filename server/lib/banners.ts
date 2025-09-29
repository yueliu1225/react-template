import type { Prisma } from '@prisma/client'
import type {
  BannerCreateInput,
  BannerUpdateInput,
  BannerDto,
} from '@/app/api/banners/banner.schema'
import { toBooleanState } from '@/lib/articles'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

const normalizeVisibility = (value: BannerCreateInput['isVisible'] | BannerUpdateInput['isVisible']) => {
  const normalized = toBooleanState(value)
  return normalized ?? false
}

export const buildBannerCreateData = (
  input: BannerCreateInput,
): Prisma.mo_bannerCreateInput => {
  const now = new Date()

  return {
    image: input.image,
    link_url: input.linkUrl ?? '',
    is_visible: normalizeVisibility(input.isVisible),
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildBannerUpdateData = (
  input: BannerUpdateInput,
): Prisma.mo_bannerUpdateInput => {
  const data: Prisma.mo_bannerUpdateInput = {
    update_time: new Date(),
  }

  if (input.image !== undefined) data.image = input.image
  if (input.linkUrl !== undefined) data.link_url = input.linkUrl ?? ''
  if (input.isVisible !== undefined) data.is_visible = normalizeVisibility(input.isVisible)

  return data
}

export const toBannerDto = (banner: Record<string, any>): BannerDto => ({
  id: banner.id,
  image: banner.image,
  linkUrl: banner.link_url ?? null,
  isVisible: Boolean(banner.is_visible),
  createTime: serializeDate(banner.create_time),
  updateTime: serializeDate(banner.update_time),
  deleteTime: serializeDate(banner.delete_time),
})
