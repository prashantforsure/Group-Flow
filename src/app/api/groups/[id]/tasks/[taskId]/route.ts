import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth/config'

type GroupMember = {
  id: string;
  role: 'ADMIN' | 'MEMBER';
  groupId: string;
  userId: string;
  joinedAt: Date;
  permissions: any; // Replace 'any' with the actual type of permissions
  group: {
    tasks: Task[];
  };
}

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignments: Assignment[];
}

type Assignment = {
  id: string;
  taskId: string;
  assigneeId: string;
}

async function checkAccess(groupId: string, userId: string): Promise<GroupMember | null> {
  const result = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId,
    },
    select: {
      id: true,
      role: true,
      groupId: true,
      userId: true,
      joinedAt: true,
      permissions: true,
      group: {
        select: {
          tasks: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              priority: true,
              assignments: {
                select: {
                  id: true,
                  taskId: true,
                  assigneeId: true,
                }
              }
            }
          }
        }
      }
    }
  });

  if (!result) return null;

  // Transform the result to match GroupMember type
  const groupMember: GroupMember = {
    id: result.id,
    role: result.role as 'ADMIN' | 'MEMBER',
    groupId: result.groupId,
    userId: result.userId,
    joinedAt: result.joinedAt,
    permissions: result.permissions,
    group: {
      tasks: result.group.tasks.map(task => ({
        ...task,
        status: task.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
        priority: task.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        assignments: task.assignments
      }))
    }
  };

  return groupMember;
}

async function checkAdminAccess(groupId: string, userId: string) {
  const groupMember = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId,
      role: 'ADMIN',
    },
  })
  
  return groupMember
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

    const { id: groupId, taskId } = params

    const groupMember = await checkAccess(groupId, session.user.id)
    if (!groupMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const task = await prisma.task.findFirst({
      where: { 
        id: taskId,
        groupId,
      },
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
        subtasks: {
          orderBy: { createdAt: 'desc' },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
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

    const { id: groupId, taskId } = params
    const body = await req.json()

    const groupMember = await checkAccess(groupId, session.user.id)

    if (!groupMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const task = groupMember.group.tasks.find((t) => t.id === taskId)

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const isAdmin = groupMember.role === 'ADMIN'
    const isAssignee = task.assignments.some(
      (assignment) => assignment.assigneeId === session.user.id
    )

    if (!isAssignee && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
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
        subtasks: {
          orderBy: { createdAt: 'desc' },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}