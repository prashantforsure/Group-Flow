import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params : {id: string } } ){
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