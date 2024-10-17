import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { TaskUpdateSchema } from "@/lib/validations/taskUpdate";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  const task = await prisma.task.findUnique({
    where: { id: id },
    include: {
      assignments: {
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      subtasks: true,
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

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const isAdmin = task.group.members[0]?.role === 'ADMIN'
  const isAssignee = task.assignments.some(a => a.assignee.id === session.user.id)

  if (!isAdmin && !isAssignee) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  return NextResponse.json(task)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const body = await req.json()

  const task = await prisma.task.findUnique({
    where: { id: id },
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

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const isAdmin = task.group.members[0]?.role === 'ADMIN'
  const isAssignee = task.assignments.some(a => a.assignee.id === session.user.id)

  if (!isAdmin && !isAssignee) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const updatedTask = await prisma.task.update({
    where: { id: id },
    data: body,
    include: {
      assignments: {
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      subtasks: true,
    },
  })

  return NextResponse.json(updatedTask)
}

export async function DELETE(
  
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { group: true }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId: task.groupId,
        userId: session.user.id,
      }
    });

    if (!groupMember || (groupMember.role !== 'ADMIN' && task.creatorId !== session.user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}