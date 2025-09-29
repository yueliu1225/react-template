import type { Prisma } from '@prisma/client'
import type {
  CommentCreateInput,
  CommentUpdateInput,
  CommentDto,
} from '@/app/api/comments/comment.schema'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export const buildCommentCreateData = (
  input: CommentCreateInput,
): Prisma.mo_commentCreateInput => {
  const now = new Date()

  return {
    uid: input.uid,
    type: input.type,
    type_id: input.typeId,
    comment_id: input.commentId,
    reply_uid: input.replyUid,
    content: input.content,
    praises: input.praises ?? 0,
    ip: input.ip ?? '',
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildCommentUpdateData = (
  input: CommentUpdateInput,
): Prisma.mo_commentUpdateInput => {
  const data: Prisma.mo_commentUpdateInput = {
    update_time: new Date(),
  }

  if (input.type !== undefined) data.type = input.type
  if (input.typeId !== undefined) data.type_id = input.typeId
  if (input.commentId !== undefined) data.comment_id = input.commentId
  if (input.replyUid !== undefined) data.reply_uid = input.replyUid
  if (input.content !== undefined) data.content = input.content
  if (input.praises !== undefined) data.praises = input.praises
  if (input.ip !== undefined) data.ip = input.ip ?? ''

  return data
}

export const toCommentDto = (comment: Record<string, any>): CommentDto => ({
  id: comment.id,
  uid: comment.uid,
  type: comment.type,
  typeId: comment.type_id,
  commentId: comment.comment_id,
  replyUid: comment.reply_uid,
  content: comment.content,
  praises: comment.praises ?? 0,
  ip: comment.ip ?? null,
  createTime: serializeDate(comment.create_time),
  updateTime: serializeDate(comment.update_time),
  deleteTime: serializeDate(comment.delete_time),
})
