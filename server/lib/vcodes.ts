import type { Prisma } from '@prisma/client'
import type {
  VcodeCreateInput,
  VcodeUpdateInput,
  VcodeDto,
} from '@/app/api/vcodes/vcode.schema'

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

export const buildVcodeCreateData = (
  input: VcodeCreateInput,
): Prisma.mo_vcodeCreateInput => ({
  account: input.account ?? null,
  code: input.code,
  ip: input.ip ?? '',
  create_time: toDateOrNull(input.createTime),
  update_time: toDateOrNull(input.updateTime),
  delete_time: null,
})

export const buildVcodeUpdateData = (
  input: VcodeUpdateInput,
): Prisma.mo_vcodeUpdateInput => {
  const data: Prisma.mo_vcodeUpdateInput = {}
  if (input.account !== undefined) data.account = input.account ?? null
  if (input.code !== undefined) data.code = input.code
  if (input.ip !== undefined) data.ip = input.ip ?? ''
  if (input.createTime !== undefined) data.create_time = toDateOrNull(input.createTime)
  if (input.updateTime !== undefined) data.update_time = toDateOrNull(input.updateTime)
  return data
}

export const toVcodeDto = (vcode: Record<string, any>): VcodeDto => ({
  id: vcode.id,
  account: vcode.account ?? null,
  code: vcode.code,
  ip: vcode.ip ?? null,
  createTime: serializeDate(vcode.create_time),
  updateTime: serializeDate(vcode.update_time),
  deleteTime: serializeDate(vcode.delete_time),
})
