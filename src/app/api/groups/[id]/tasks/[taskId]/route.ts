import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config';
import prisma from '@/lib/db';


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

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignments: {
          include: {
            assignee: true
          }
        
        },
        subtasks: true,
        group: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const groupMember = await prisma.groupMember.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
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

    const isAssignee = task.assignments.some(assignment => assignment.assignee.id === session.user.id)

    if (!isAssignee) {
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
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, taskId } = params

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        group: {
          include: {
            members: {
              where: { userId: session.user.id },
              select: { role: true },
            },
          },
        },
        assignments: {
          include: {
            assignee: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.groupId !== id) {
      return NextResponse.json({ error: 'Task not found in this group' }, { status: 404 })
    }
    const isAdmin = task.group.members[0]?.role === 'ADMIN'
    const isAssignee = task.assignments.some(a => a.assignee.id === session.user.id)

    if (!isAdmin && !isAssignee) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await prisma.$transaction(async (tx) => {
   
      await tx.taskAssignment.deleteMany({
        where: { taskId }
      })

      await tx.task.deleteMany({
        where: { parentId: taskId }
      })
      await tx.task.delete({
        where: { id: taskId }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}