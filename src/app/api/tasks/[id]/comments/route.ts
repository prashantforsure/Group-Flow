import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { CommentCreateSchema } from "@/lib/validations/comments";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } } ){
try{
    const session = await getServerSession(authOptions);
    if(!session?.user?.email){
        return NextResponse.json({
            message: "no auth"
        }, {
            status: 401
        })
    }
    const task = await prisma.task.findUnique({
        where: {
            id : params.id
        }, include: {
            group: true
        }
    })
    if(!task){
        return NextResponse.json({
            message: "no task found"
        }, {
            status:404
        })
    }
    const groupMember = await prisma.groupMember.findFirst({
        where: {
            groupId: task.groupId,
            userId: session.user.id
        }
    })
    if(!groupMember){
        return NextResponse.json({
            message: "not a group member"
        })
    }
    const comment = await prisma.comment.findMany({
        where: {
            taskId: params.id
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                }, 
            },
            attachments: true
        },
        orderBy: { createdAt: 'desc'}
    })
    return NextResponse.json(comment)
}catch(error){
    return NextResponse.json({
        error: 'internal error'
    }, {
        status: 500
    })
}
}


export async function POST(req: NextRequest, { params }: { params: { id: string } }){
    try{
        const session = await getServerSession(authOptions);
        if (!session?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await req.json();
        const { content } = CommentCreateSchema.parse(body);
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
      
          if (!groupMember) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }
        const comment = await prisma.comment.create({
      data: {
        content,
        task: { connect: { id: params.id } },
        author: { connect: { id: session.user.id } }
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    return NextResponse.json(comment);
    }catch(error){
        console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}