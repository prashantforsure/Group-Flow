import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth/config'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, taskId } = params
    const body = await req.json()

    const parentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignments: {
          include: {
            assignee: true
          }
        },
      },
    })

    if (!parentTask) {
      return NextResponse.json({ error: 'Parent task not found' }, { status: 404 })
    }

    const isAdmin = await prisma.groupMember.findFirst({
      where: {
        id,
        userId: session.user.id,
        role: 'ADMIN',
      },
    })

    const isAssignee = parentTask.assignments.some(assignment => assignment.assignee.id === session.user.id)

    if (!isAssignee && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const subtask = await prisma.task.create({
      data: {
        ...body,
        parentId: taskId,
        groupId: parentTask.groupId,
        creatorId: session.user.id,
      },
    })

    return NextResponse.json(subtask)
  } catch (error) {
    console.error('Error creating subtask:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, taskId } = params

    const groupMember = await prisma.groupMember.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

   

    const subtasks = await prisma.task.findMany({
      where: { parentId: taskId },
      include: {
        assignments: {
          include: {
            assignee: true
          }
        },
      },
    })

    return NextResponse.json(subtasks)
  } catch (error) {
    console.error('Error fetching subtasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}