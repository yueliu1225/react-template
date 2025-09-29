import type { Prisma } from '@prisma/client'
import type {
  SigninHistoryCreateInput,
  SigninHistoryUpdateInput,
  SigninHistoryDto,
} from '@/app/api/signin-history/signinHistory.schema'

const toDateOrNull = (value: string | null | undefined): Date | null => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export const buildSigninHistoryCreateData = (
  input: SigninHistoryCreateInput,
): Prisma.mo_signin_historyCreateInput => ({
  uid: input.uid ?? null,
  create_time: toDateOrNull(input.createTime),
  delete_time: null,
})

export const buildSigninHistoryUpdateData = (
  input: SigninHistoryUpdateInput,
): Prisma.mo_signin_historyUpdateInput => {
  const data: Prisma.mo_signin_historyUpdateInput = {}
  if (input.uid !== undefined) data.uid = input.uid ?? null
  if (input.createTime !== undefined) data.create_time = toDateOrNull(input.createTime)
  return data
}

export const toSigninHistoryDto = (entry: Record<string, any>): SigninHistoryDto => ({
  id: entry.id,
  uid: entry.uid ?? null,
  createTime: serializeDate(entry.create_time),
  deleteTime: serializeDate(entry.delete_time),
})
