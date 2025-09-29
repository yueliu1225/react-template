import type { Prisma } from '@prisma/client'
import type {
  ViewCreateInput,
  ViewUpdateInput,
  ViewDto,
} from '@/app/api/views/view.schema'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export const buildViewCreateData = (
  input: ViewCreateInput,
): Prisma.mo_viewsCreateInput => {
  const now = new Date()

  return {
    uid: input.uid ?? null,
    content_type: input.contentType,
    content_id: input.contentId ?? null,
    create_time: now,
    delete_time: null,
  }
}

export const buildViewUpdateData = (
  input: ViewUpdateInput,
): Prisma.mo_viewsUpdateInput => {
  const data: Prisma.mo_viewsUpdateInput = {}

  if (input.uid !== undefined) data.uid = input.uid ?? null
  if (input.contentType !== undefined) data.content_type = input.contentType
  if (input.contentId !== undefined) data.content_id = input.contentId ?? null

  return data
}

export const toViewDto = (view: Record<string, any>): ViewDto => ({
  id: view.id,
  uid: view.uid ?? null,
  contentType: view.content_type ?? null,
  contentId: view.content_id ?? null,
  createTime: serializeDate(view.create_time),
  deleteTime: serializeDate(view.delete_time),
})
