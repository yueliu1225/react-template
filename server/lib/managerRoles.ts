import { Prisma } from '@prisma/client'
import type {
  ManagerRoleCreateInput,
  ManagerRoleUpdateInput,
  ManagerRoleDto,
} from '@/app/api/manager-roles/managerRole.schema'

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

export const buildManagerRoleCreateData = (
  input: ManagerRoleCreateInput,
): Prisma.mo_manager_roleCreateInput => {
  const now = new Date()

  return {
    title: input.title,
    permissions: sanitizeJson(input.permissions ?? null),
    create_time: now,
    update_time: now,
    delete_time: null,
  }
}

export const buildManagerRoleUpdateData = (
  input: ManagerRoleUpdateInput,
): Prisma.mo_manager_roleUpdateInput => {
  const data: Prisma.mo_manager_roleUpdateInput = {
    update_time: new Date(),
  }

  if (input.title !== undefined) data.title = input.title
  if (input.permissions !== undefined) data.permissions = sanitizeJson(input.permissions ?? null)

  return data
}

export const toManagerRoleDto = (role: Record<string, any>): ManagerRoleDto => ({
  id: role.id,
  title: role.title,
  permissions: role.permissions ?? null,
  createTime: serializeDate(role.create_time),
  updateTime: serializeDate(role.update_time),
  deleteTime: serializeDate(role.delete_time),
})
