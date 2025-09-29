import type { Prisma } from '@prisma/client'
import type {
  ColumnRequestCreateInput,
  ColumnRequestUpdateInput,
  ColumnRequestDto,
  ColumnRequestState,
} from '@/app/api/column-requests/columnRequest.schema'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export const toStateString = (value: unknown): ColumnRequestState => {
  if (value === 1 || value === 'approved') return 'approved'
  if (value === 0 || value === 'rejected') return 'rejected'
  return 'pending'
}

export const toStateInt = (value: unknown): number => {
  if (value === 1 || value === 'approved') return 1
  if (value === 0 || value === 'rejected') return 0
  return -1
}

export const buildColumnRequestCreateData = (
  input: ColumnRequestCreateInput,
): Prisma.mo_column_requestCreateInput => {
  const now = new Date()

  return {
    uid: input.uid,
    title: input.title,
    thumbnail: input.thumbnail ?? '',
    summary: input.summary ?? null,
    state: toStateInt(input.state),
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildColumnRequestUpdateData = (
  input: ColumnRequestUpdateInput,
): Prisma.mo_column_requestUpdateInput => {
  const data: Prisma.mo_column_requestUpdateInput = {
    update_time: new Date(),
  }

  if (input.uid !== undefined) data.uid = input.uid
  if (input.title !== undefined) data.title = input.title
  if (input.thumbnail !== undefined) data.thumbnail = input.thumbnail ?? ''
  if (input.summary !== undefined) data.summary = input.summary ?? null
  if (input.state !== undefined) data.state = toStateInt(input.state)

  return data
}

export const toColumnRequestDto = (request: Record<string, any>): ColumnRequestDto => ({
  id: request.id,
  uid: request.uid,
  title: request.title,
  thumbnail: request.thumbnail ?? null,
  summary: request.summary ?? null,
  state: toStateString(request.state),
  createTime: serializeDate(request.create_time),
  updateTime: serializeDate(request.update_time),
  deleteTime: serializeDate(request.delete_time),
})
