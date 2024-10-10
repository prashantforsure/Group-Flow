import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { TaskUpdateSchema } from "@/lib/validations/taskUpdate";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET({ params }: { params : { id: string } } ){
try{
    const session = await getServerSession(authOptions)
    if(!session?.user?.email){
        return NextResponse.json({
            message: "unauthorized"
        }, {
            status: 401
        })
    }
    const task = await prisma.task.findUnique({
        where: { id : params.id },
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
            group: true,
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
    if(!task){
        return NextResponse.json({
            message: 'task does not exist'
        }, {
            status: 404
        })
    }
    const isMember = await prisma.groupMember.findFirst({
        where: {
          groupId: task.groupId,
          userId: session.user.id,
        }
      });
      if(!isMember){
        return NextResponse.json({
            message: "no access to task"
        }, {
            status: 403
        })
      }
     return NextResponse.json(task)
}catch(error){
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
}

export async function PUT(req: NextRequest, { params }: { params : { id: string } }){
try{
const session = await getServerSession(authOptions)
if(!session?.user?.email){
  return NextResponse.json({
    message: " unauth"
  }, {
    status: 401
  })
}
const body = await req.json();
const validatedData = TaskUpdateSchema.parse(body)

const task = await prisma.task.findUnique({
  where: {
    id: params.id
  }, include: {
    group: true
  }
})
if(!task){
  return NextResponse.json({
    message: "no task found"
  }, {
    status: 404
  })
}
   const isMember = await prisma.groupMember.findFirst({
    where: {
      groupId: task.groupId
    }
   })
   if (!isMember) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  const updatedTask = await prisma.task.update({
    where: { id: params.id },
    data: validatedData,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
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
      group: true,
    }
  });
  return NextResponse.json(updatedTask)
}catch(error){
  return NextResponse.json({ error: 'Internal server error' },
     { status: 500 });
}
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