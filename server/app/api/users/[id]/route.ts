import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return new NextResponse('Invalid ID', { status: 400 })
    }

    const user = await prisma.mo_user.findUnique({
      where: { id },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return new NextResponse('Failed to fetch user', { status: 500 })
  }
}

// PUT /api/users/:id
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  if (isNaN(id)) return new NextResponse('Invalid ID', { status: 400 })

  try {
    const data = await request.json()

    const updatedUser = await prisma.mo_user.update({
      where: { id },
      data: {
        ...data,
        update_time: new Date(), // 可自动更新修改时间
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to update user', { status: 500 })
  }
}

// DELETE /api/users/:id
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  if (isNaN(id)) return new NextResponse('Invalid ID', { status: 400 })

  try {
    await prisma.mo_user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete user', { status: 500 })
  }
}
