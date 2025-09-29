import type { Prisma } from '@prisma/client'
import type {
  CollectCreateInput,
  CollectUpdateInput,
  CollectDto,
} from '@/app/api/collects/collect.schema'
import { toBooleanState } from '@/lib/articles'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

const normalizeValidity = (
  value: CollectCreateInput['isValid'] | CollectUpdateInput['isValid'],
): boolean => toBooleanState(value) ?? true

export const buildCollectCreateData = (
  input: CollectCreateInput,
): Prisma.mo_collectCreateInput => {
  const now = new Date()

  return {
    uid: input.uid,
    type: input.type,
    type_id: input.typeId,
    title: input.title,
    is_valid: normalizeValidity(input.isValid),
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildCollectUpdateData = (
  input: CollectUpdateInput,
): Prisma.mo_collectUpdateInput => {
  const data: Prisma.mo_collectUpdateInput = {
    update_time: new Date(),
  }

  if (input.type !== undefined) data.type = input.type
  if (input.typeId !== undefined) data.type_id = input.typeId
  if (input.title !== undefined) data.title = input.title
  if (input.isValid !== undefined) data.is_valid = normalizeValidity(input.isValid)

  return data
}

export const toCollectDto = (collect: Record<string, any>): CollectDto => ({
  id: collect.id,
  uid: collect.uid,
  type: collect.type,
  typeId: collect.type_id,
  title: collect.title,
  isValid: Boolean(collect.is_valid),
  createTime: serializeDate(collect.create_time),
  updateTime: serializeDate(collect.update_time),
  deleteTime: serializeDate(collect.delete_time),
})
