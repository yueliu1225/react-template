export interface MoUser {
  id: number
  mobile: string
  email: string
  password: string
  nickname: string
  avatar: string
  gender: number
  org_type: number
  org_title: string
  praises: number
  follows: number
  fans: number
  topics: number
  articles: number
  state: number
  summary: string
  manager_role_id: number
  token: string
  token_time: number
  create_time: string
  update_time: string
  delete_time: string
  curr_duration: number
  max_duration: number
  last_sign_in_date: string
  points: number
}