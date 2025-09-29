import { z } from 'zod'

const idSchema = z.coerce.number().int().positive()

const booleanLikeSchema = z
  .union([
    z.boolean(),
    z.coerce
      .number()
      .int()
      .refine((value) => value === 0 || value === 1, 'Boolean-like values must be 0 or 1 when numeric')
      .transform((value) => value === 1),
    z
      .string()
      .trim()
      .transform((value) => {
        const lower = value.toLowerCase()
        if (lower === 'true') return true
        if (lower === 'false') return false
        throw new Error('Value must be boolean-like')
      }),
  ])

const stateStringSchema = z.union([
  z.literal('active'),
  z.literal('disabled'),
  z.literal('pending'),
])

const stateNumericSchema = z
  .coerce
  .number()
  .int()
  .refine((value) => value === 1 || value === 0 || value === -1, 'State must be 1, 0, or -1 when numeric')

export const userStateSchema = z.union([stateStringSchema, stateNumericSchema]).optional()

export const userQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  email: z.string().trim().email().optional(),
  mobile: z.string().trim().max(100).optional(),
  state: userStateSchema,
  includeDeleted: z.coerce.boolean().optional(),
  search: z.string().trim().min(1).optional(),
})

export const userCreateSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
  nickname: z.string().trim().min(1).max(255),
  mobile: z.string().trim().max(100).optional(),
  avatar: z.string().trim().max(255).optional(),
  gender: z.coerce.number().int().min(0).max(3).optional(),
  orgType: booleanLikeSchema.optional(),
  orgTitle: z.string().trim().max(255).optional(),
  summary: z.string().trim().max(255).optional(),
  managerRoleId: z.coerce.number().int().min(0).optional(),
  state: userStateSchema,
  points: z.coerce.number().int().min(0).optional(),
})

export const userUpdateSchema = z
  .object({
    email: z.string().trim().email().optional(),
    password: z.string().min(6).optional(),
    nickname: z.string().trim().min(1).max(255).optional(),
    mobile: z.string().trim().max(100).optional(),
    avatar: z.string().trim().max(255).optional(),
    gender: z.coerce.number().int().min(0).max(3).optional(),
    orgType: booleanLikeSchema.optional(),
    orgTitle: z.string().trim().max(255).optional(),
    summary: z.string().trim().max(255).optional(),
    managerRoleId: z.coerce.number().int().min(0).optional(),
    state: userStateSchema,
    points: z.coerce.number().int().min(0).optional(),
  })
  .extend({ id: idSchema.optional() })

export type UserQuery = z.infer<typeof userQuerySchema>
export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>

export type UserState = 'active' | 'disabled' | 'pending'

export type UserDto = {
  id: number
  mobile: string | null
  email: string
  nickname: string
  avatar: string | null
  gender: number
  orgType: boolean
  orgTitle: string | null
  praises: number
  follows: number
  fans: number
  topics: number
  articles: number
  state: UserState
  summary: string | null
  managerRoleId: number
  createTime: string | null
  updateTime: string | null
  deleteTime: string | null
  currDuration: number
  maxDuration: number
  lastSignInDate: string | null
  points: number
}
