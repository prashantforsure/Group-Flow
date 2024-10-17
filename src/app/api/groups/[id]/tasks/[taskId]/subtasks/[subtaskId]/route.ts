import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth/config'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string; subtaskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, taskId, subtaskId } = params
    const body = await req.json()

    const parentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignments: {
          include: {
            assignee: {
              select: {
                id: true,
              },
            },
          },
        },
        group: {
          include: {
            members: {
              where: { userId: session.user.id },
              select: { role: true },
            },
          },
        },
      },
    })

    if (!parentTask) {
      return NextResponse.json({ error: 'Parent task not found' }, { status: 404 })
    }

    const isAdmin = parentTask.group.members[0]?.role === 'ADMIN'
    const isAssignee = parentTask.assignments.some(a => a.assignee.id === session.user.id)

    if (!isAdmin || !isAssignee) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const updatedSubtask = await prisma.task.update({
      where: { id: subtaskId },
      data: body,
    })

    return NextResponse.json(updatedSubtask)
  } catch (error) {
    console.error('Error updating subtask:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string; subtaskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, taskId, subtaskId } = params

    const parentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignments: {
          include: {
            assignee: {
              select: {
                id: true,
              },
            },
          },
        },
        group: {
          include: {
            members: {
              where: { userId: session.user.id },
              select: { role: true },
            },
          },
        },
      },
    })

    if (!parentTask) {
      return NextResponse.json({ error: 'Parent task not found' }, { status: 404 })
    }

    const isAdmin = parentTask.group.members[0]?.role === 'ADMIN'
    const isAssignee = parentTask.assignments.some(a => a.assignee.id === session.user.id)

    if (!isAdmin || !isAssignee) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await prisma.task.delete({
      where: { id: subtaskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subtask:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}