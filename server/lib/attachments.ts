import type { Prisma } from '@prisma/client'
import type {
  AttachmentCreateInput,
  AttachmentUpdateInput,
  AttachmentDto,
} from '@/app/api/attachments/attachment.schema'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export const buildAttachmentCreateData = (
  input: AttachmentCreateInput,
): Prisma.mo_attachmentsCreateInput => {
  const now = new Date()

  return {
    uid: input.uid ?? null,
    file: input.file,
    file_name: input.fileName,
    file_size: input.fileSize,
    file_extension: input.fileExtension,
    parent_id: input.parentId ?? null,
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildAttachmentUpdateData = (
  input: AttachmentUpdateInput,
): Prisma.mo_attachmentsUpdateInput => {
  const data: Prisma.mo_attachmentsUpdateInput = {
    update_time: new Date(),
  }

  if (input.uid !== undefined) data.uid = input.uid ?? null
  if (input.file !== undefined) data.file = input.file ?? null
  if (input.fileName !== undefined) data.file_name = input.fileName ?? null
  if (input.fileSize !== undefined) data.file_size = input.fileSize ?? null
  if (input.fileExtension !== undefined) data.file_extension = input.fileExtension ?? null
  if (input.parentId !== undefined) data.parent_id = input.parentId ?? null

  return data
}

export const toAttachmentDto = (attachment: Record<string, any>): AttachmentDto => ({
  id: attachment.id,
  uid: attachment.uid ?? null,
  file: attachment.file ?? null,
  fileName: attachment.file_name ?? null,
  fileSize: attachment.file_size ?? null,
  fileExtension: attachment.file_extension ?? null,
  parentId: attachment.parent_id ?? null,
  createTime: serializeDate(attachment.create_time),
  updateTime: serializeDate(attachment.update_time),
  deleteTime: serializeDate(attachment.delete_time),
})
