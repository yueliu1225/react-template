// /server/app/api/users/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET() {
  try {
    const users = await prisma.mo_user.findMany()
    return NextResponse.json(users)
  } catch (error) {
    return new NextResponse('Failed to fetch users', { status: 500 })
  }
}
