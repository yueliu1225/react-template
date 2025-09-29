import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

export const managerRoleCreateSchema = z.object({
  title: z.string().trim().min(1).max(255),
  permissions: z.record(z.any()).or(z.array(z.any())).nullable().optional(),
})

export const managerRoleUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    permissions: z.record(z.any()).or(z.array(z.any())).nullable().optional(),
  })
  .extend({ id: idSchema })

export const managerRoleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(255).optional(),
  includeDeleted: z.coerce.boolean().optional(),
})

export type ManagerRoleCreateInput = z.infer<typeof managerRoleCreateSchema>
export type ManagerRoleUpdateInput = z.infer<typeof managerRoleUpdateSchema>
export type ManagerRoleQuery = z.infer<typeof managerRoleQuerySchema>

export type ManagerRoleDto = {
  id: number
  title: string
  permissions: unknown
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
}
