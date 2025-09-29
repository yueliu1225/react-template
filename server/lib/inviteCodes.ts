import type { Prisma } from '@prisma/client'
import type {
  InviteCodeCreateInput,
  InviteCodeUpdateInput,
  InviteCodeDto,
} from '@/app/api/invite-codes/inviteCode.schema'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export const buildInviteCodeCreateData = (
  input: InviteCodeCreateInput,
): Prisma.mo_invite_codeCreateInput => {
  const now = new Date()

  return {
    uid: input.uid,
    code: input.code,
    contact: input.contact ?? null,
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildInviteCodeUpdateData = (
  input: InviteCodeUpdateInput,
): Prisma.mo_invite_codeUpdateInput => {
  const data: Prisma.mo_invite_codeUpdateInput = {
    update_time: new Date(),
  }

  if (input.uid !== undefined) data.uid = input.uid
  if (input.code !== undefined) data.code = input.code
  if (input.contact !== undefined) data.contact = input.contact ?? null

  return data
}

export const toInviteCodeDto = (code: Record<string, any>): InviteCodeDto => ({
  id: code.id,
  uid: code.uid,
  code: code.code,
  contact: code.contact ?? null,
  createTime: serializeDate(code.create_time),
  updateTime: serializeDate(code.update_time),
  deleteTime: serializeDate(code.delete_time),
})
