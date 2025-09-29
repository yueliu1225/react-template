import { createHash } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import {
  UserCreateInput,
  UserDto,
  UserState,
  UserUpdateInput,
} from '@/app/api/users/user.schema'
import { toBooleanState } from '@/lib/articles'

export const toStateString = (value: unknown): UserState => {
  if (value === 1 || value === 'active') return 'active'
  if (value === 0 || value === 'disabled') return 'disabled'
  return 'pending'
}

export const toStateInt = (value: unknown): number => {
  if (value === 1 || value === 'active') return 1
  if (value === 0 || value === 'disabled') return 0
  return -1
}

const serializeDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

const hashPassword = (password: string) =>
  createHash('sha256').update(password).digest('hex')

export const buildUserCreateData = (
  input: UserCreateInput,
): Prisma.mo_userCreateInput => {
  const now = new Date()
  const orgType = input.orgType !== undefined ? input.orgType : false
  const stateValue = input.state ?? 'active'

  return {
    mobile: input.mobile ?? '',
    email: input.email,
    password: hashPassword(input.password),
    nickname: input.nickname,
    avatar: input.avatar ?? '',
    gender: input.gender ?? 3,
    org_type: orgType,
    org_title: input.orgTitle ?? '',
    praises: 0,
    follows: 0,
    fans: 0,
    topics: 0,
    articles: 0,
    state: toStateInt(stateValue),
    summary: input.summary ?? '',
    manager_role_id: input.managerRoleId ?? 0,
    token: '',
    token_time: 0,
    create_time: now,
    update_time: now,
    delete_time: null,
    curr_duration: 0,
    max_duration: 0,
    last_sign_in_date: new Date('1990-01-01T00:00:00.000Z'),
    points: input.points ?? 0,
  }
}

export const buildUserUpdateData = (
  input: UserUpdateInput,
): Prisma.mo_userUpdateInput => {
  const data: Prisma.mo_userUpdateInput = {
    update_time: new Date(),
  }

  if (input.email !== undefined) data.email = input.email
  if (input.password !== undefined) data.password = hashPassword(input.password)
  if (input.nickname !== undefined) data.nickname = input.nickname
  if (input.mobile !== undefined) data.mobile = input.mobile ?? ''
  if (input.avatar !== undefined) data.avatar = input.avatar ?? ''
  if (input.gender !== undefined) data.gender = input.gender
  if (input.orgType !== undefined) data.org_type = input.orgType
  if (input.orgTitle !== undefined) data.org_title = input.orgTitle ?? ''
  if (input.summary !== undefined) data.summary = input.summary ?? ''
  if (input.managerRoleId !== undefined) data.manager_role_id = input.managerRoleId
  if (input.state !== undefined) data.state = toStateInt(input.state)
  if (input.points !== undefined) data.points = input.points

  return data
}

export const toUserDto = (user: Record<string, any>): UserDto => ({
  id: user.id,
  mobile: user.mobile || null,
  email: user.email,
  nickname: user.nickname,
  avatar: user.avatar || null,
  gender: user.gender ?? 3,
  orgType: toBooleanState(user.org_type) ?? false,
  orgTitle: user.org_title || null,
  praises: user.praises ?? 0,
  follows: user.follows ?? 0,
  fans: user.fans ?? 0,
  topics: user.topics ?? 0,
  articles: user.articles ?? 0,
  state: toStateString(user.state),
  summary: user.summary || null,
  managerRoleId: user.manager_role_id ?? 0,
  createTime: serializeDate(user.create_time),
  updateTime: serializeDate(user.update_time),
  deleteTime: serializeDate(user.delete_time),
  currDuration: user.curr_duration ?? 0,
  maxDuration: user.max_duration ?? 0,
  lastSignInDate: serializeDate(user.last_sign_in_date),
  points: user.points ?? 0,
})
