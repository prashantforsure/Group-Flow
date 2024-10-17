import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth/config'
import { z } from 'zod'


const subtaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
})
async function checkAccess(groupId: string, userId: string) {
  const groupMember = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId,
      
    },
  })
  
  return groupMember
}
export async function POST(
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

    const validatedData = subtaskSchema.parse(body)

    const [groupMember, parentTask] = await Promise.all([
      checkAccess(groupId, session.user.id),
      prisma.task.findFirst({
        where: { 
          id: taskId,
          groupId,
         
        },
        include: {
          assignments: {
            include: {
              assignee: true
            }
          },
        },
      })
    ])

    if (!groupMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!parentTask) {
      return NextResponse.json({ error: 'Parent task not found' }, { status: 404 })
    }
    const isAdmin = groupMember.role === 'ADMIN'
    const isAssignee = parentTask.assignments.some(
      assignment => assignment.assignee.id === session.user.id
    )

    if (!isAssignee && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    const subtask = await prisma.task.create({
      data: {
        ...validatedData,
        parentId: taskId,
        groupId: parentTask.groupId,
        creatorId: session.user.id,
      },
      include: {
        assignments: {
          include: {
            assignee: true
          }
        },
      },
    })

    return NextResponse.json(subtask)
  } catch (error) {
    console.error('Error creating subtask:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}