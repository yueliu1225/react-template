import type { Prisma } from '@prisma/client'
import type {
  FollowCreateInput,
  FollowUpdateInput,
  FollowDto,
} from '@/app/api/follows/follow.schema'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export const buildFollowCreateData = (
  input: FollowCreateInput,
): Prisma.mo_followCreateInput => {
  const now = new Date()

  return {
    uid: input.uid,
    type_id: input.typeId,
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildFollowUpdateData = (
  input: FollowUpdateInput,
): Prisma.mo_followUpdateInput => {
  const data: Prisma.mo_followUpdateInput = {
    update_time: new Date(),
  }

  if (input.uid !== undefined) data.uid = input.uid
  if (input.typeId !== undefined) data.type_id = input.typeId

  return data
}

export const toFollowDto = (follow: Record<string, any>): FollowDto => ({
  id: follow.id,
  uid: follow.uid,
  typeId: follow.type_id,
  createTime: serializeDate(follow.create_time),
  updateTime: serializeDate(follow.update_time),
  deleteTime: serializeDate(follow.delete_time),
})
