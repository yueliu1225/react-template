import type { Prisma } from '@prisma/client'
import type {
  NoticeCreateInput,
  NoticeUpdateInput,
  NoticeDto,
} from '@/app/api/notices/notice.schema'
import { toBooleanState } from '@/lib/articles'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export const buildNoticeCreateData = (
  input: NoticeCreateInput,
): Prisma.mo_noticeCreateInput => {
  const now = new Date()

  return {
    uid: input.uid,
    category: input.category ?? '',
    content: input.content ?? null,
    send_uid: input.sendUid,
    is_new: toBooleanState(input.isNew) ?? true,
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildNoticeUpdateData = (
  input: NoticeUpdateInput,
): Prisma.mo_noticeUpdateInput => {
  const data: Prisma.mo_noticeUpdateInput = {
    update_time: new Date(),
  }

  if (input.uid !== undefined) data.uid = input.uid
  if (input.category !== undefined) data.category = input.category ?? ''
  if (input.content !== undefined) data.content = input.content ?? null
  if (input.sendUid !== undefined) data.send_uid = input.sendUid
  if (input.isNew !== undefined) data.is_new = toBooleanState(input.isNew) ?? true

  return data
}

export const toNoticeDto = (notice: Record<string, any>): NoticeDto => ({
  id: notice.id,
  uid: notice.uid,
  category: notice.category ?? null,
  content: notice.content ?? null,
  sendUid: notice.send_uid,
  isNew: Boolean(notice.is_new),
  createTime: serializeDate(notice.create_time),
  updateTime: serializeDate(notice.update_time),
  deleteTime: serializeDate(notice.delete_time),
})
