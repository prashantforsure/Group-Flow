
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth/config';


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subtasks = await prisma.task.findMany({
      where: { parentId: params.id },
    });
    return NextResponse.json(subtasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subtasks' }, { status: 500 });
  }
}

export async function POST(
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

  const newSubtask = await prisma.task.create({
    data: {
      ...body,
      parentId: id,
      groupId: task.groupId,
      creatorId: session.user.id,
    },
  })

  return NextResponse.json(newSubtask)
}