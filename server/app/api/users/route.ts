import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users
export async function GET() {
  try {
    const users = await prisma.mo_user.findMany()
    return NextResponse.json(users)
  } catch (error) {
    return new NextResponse('Failed to fetch users', { status: 500 })
  }
}

// POST /api/users
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // 可选：验证字段
    if (!data.email || !data.password || !data.nickname) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const newUser = await prisma.mo_user.create({
      data: {
        mobile: data.mobile || '',
        email: data.email,
        password: data.password,
        nickname: data.nickname,
        avatar: data.avatar || '',
        gender: data.gender || 3,
        org_type: data.org_type || false,
        org_title: data.org_title || '',
        praises: 0,
        follows: 0,
        fans: 0,
        topics: 0,
        articles: 0,
        state: data.state || true,
        summary: '',
        manager_role_id: 0,
        token: '',
        token_time: 0,
        create_time: new Date(),
        update_time: new Date(),
        delete_time: null,
        curr_duration: 0,
        max_duration: 0,
        last_sign_in_date: new Date('1990-01-01T00:00:00'),
        points: 0,
      },
    })

    return NextResponse.json(newUser)
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to create user', { status: 500 })
  }
}
