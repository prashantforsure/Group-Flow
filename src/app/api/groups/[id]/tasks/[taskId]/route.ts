import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth/config'

export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { groupId, taskId } = params

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignments: {
          include: {
            assignee: true
          }
        },
        subtasks: true,
        parent: true,
        creator: true,
        group: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
    })

    if (!groupMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { groupId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { groupId, taskId } = params
    const body = await req.json()

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignments: {
          include: {
            assignee: true
          }
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const isAdmin = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
        role: 'ADMIN',
      },
    })

    const isAssignee = task.assignments.some(assignment => assignment.assignee.id === session.user.id)

    if (!isAssignee && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: body,
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { groupId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { groupId, taskId } = params

    const isAdmin = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
        role: 'ADMIN',
      },
    })

    if (!isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await prisma.task.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}