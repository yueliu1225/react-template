import { Prisma } from '@prisma/client'
import type {
  ReportCreateInput,
  ReportUpdateInput,
  ReportDto,
  ReportState,
} from '@/app/api/reports/report.schema'

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

const sanitizeJson = (
  value: unknown,
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined => {
  if (value === undefined) return undefined
  if (value === null) return Prisma.JsonNull
  return value as Prisma.InputJsonValue
}

export const toReportStateString = (value: unknown): ReportState => {
  if (value === 1 || value === 'approved') return 'approved'
  if (value === 0 || value === 'rejected') return 'rejected'
  return 'pending'
}

export const toReportStateInt = (value: unknown): number => {
  if (value === 1 || value === 'approved') return 1
  if (value === 0 || value === 'rejected') return 0
  return -1
}

export const buildReportCreateData = (
  input: ReportCreateInput,
): Prisma.mo_reportCreateInput => {
  const now = new Date()

  return {
    uid: input.uid,
    type: input.type,
    type_id: input.typeId,
    category: input.category ?? 0,
    summary: input.summary ?? null,
    state: toReportStateInt(input.state),
    type_data: sanitizeJson(input.typeData ?? null),
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildReportUpdateData = (
  input: ReportUpdateInput,
): Prisma.mo_reportUpdateInput => {
  const data: Prisma.mo_reportUpdateInput = {
    update_time: new Date(),
  }

  if (input.uid !== undefined) data.uid = input.uid
  if (input.type !== undefined) data.type = input.type
  if (input.typeId !== undefined) data.type_id = input.typeId
  if (input.category !== undefined) data.category = input.category
  if (input.summary !== undefined) data.summary = input.summary ?? null
  if (input.state !== undefined) data.state = toReportStateInt(input.state)
  if (input.typeData !== undefined) data.type_data = sanitizeJson(input.typeData ?? null)

  return data
}

export const toReportDto = (report: Record<string, any>): ReportDto => ({
  id: report.id,
  uid: report.uid,
  type: report.type,
  typeId: report.type_id,
  category: report.category ?? 0,
  summary: report.summary ?? null,
  state: toReportStateString(report.state),
  typeData: report.type_data ?? null,
  createTime: serializeDate(report.create_time),
  updateTime: serializeDate(report.update_time),
  deleteTime: serializeDate(report.delete_time),
})
