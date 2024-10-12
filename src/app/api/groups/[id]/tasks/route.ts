import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import prisma from '@/lib/db'


export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({
        message: "unauthorized"
      }, {
        status: 401
      })
    }

    const groupId = params.id

    const isMember = await prisma.groupMember.findFirst({
      where: {
        groupId: groupId,
        userId: session.user.id,
      }
    })

    if (!isMember) {
      return NextResponse.json({
        message: "no access to group tasks"
      }, {
        status: 403
      })
    }

    const tasks = await prisma.task.findMany({
      where: { groupId: groupId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        assignments: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              }
            }
          }
        },
        subtasks: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}