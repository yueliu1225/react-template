import type { Prisma } from '@prisma/client'
import type {
  PraiseCreateInput,
  PraiseUpdateInput,
  PraiseDto,
} from '@/app/api/praises/praise.schema'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export const buildPraiseCreateData = (
  input: PraiseCreateInput,
): Prisma.mo_praiseCreateInput => {
  const now = new Date()

  return {
    uid: input.uid,
    type: input.type,
    type_id: input.typeId,
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildPraiseUpdateData = (
  input: PraiseUpdateInput,
): Prisma.mo_praiseUpdateInput => {
  const data: Prisma.mo_praiseUpdateInput = {
    update_time: new Date(),
  }

  if (input.uid !== undefined) data.uid = input.uid
  if (input.type !== undefined) data.type = input.type
  if (input.typeId !== undefined) data.type_id = input.typeId

  return data
}

export const toPraiseDto = (praise: Record<string, any>): PraiseDto => ({
  id: praise.id,
  uid: praise.uid,
  type: praise.type,
  typeId: praise.type_id,
  createTime: serializeDate(praise.create_time),
  updateTime: serializeDate(praise.update_time),
  deleteTime: serializeDate(praise.delete_time),
})
