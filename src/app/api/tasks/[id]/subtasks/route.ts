import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { SubtaskCreateSchema } from "@/lib/validations/tasks";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } } ){
try{
    const session = await getServerSession(authOptions);
    if(!session?.user?.email){
        return NextResponse.json({
            message: "no auth"
        }, {
        status: 401
        })
    }
    const body = await req.json()
    const { title , description, dueDate, assigneeIds, priority } = SubtaskCreateSchema.parse(body)

    const parentTask = await prisma.task.findUnique({
        where: { id: params.id },
        include: { group: true }
      });
    if (!parentTask) {
        return NextResponse.json({ error: 'Parent task not found' }, { status: 404 });
    }
    const groupMember = await prisma.groupMember.findFirst({
        where: {
            groupId: parentTask.groupId,
            userId: session.user.id,
        }
    })
    if (!groupMember) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      const subtask = await prisma.task.create({
        data: {
          title: title,
          description: description,
          priority: priority,
          status: 'PENDING',
          dueDate: dueDate ? new Date(dueDate) : undefined,
          group: { connect: { id: parentTask.groupId } },
          creator: { connect: { id: session.user.id } },
          parent: { connect: { id: params.id } },
          assignments: assigneeIds ? {
            create: assigneeIds.map(assigneeId => ({
              assignee: { connect: { id: assigneeId } },
              role: 'RESPONSIBLE'
            }))
          } : undefined,
        },
        include: {
          creator: { select: { id: true, name: true, email: true, avatar: true } },
          assignments: {
            include: {
              assignee: { select: { id: true, name: true, email: true, avatar: true } }
            }
          }
        }
      });
    return NextResponse.json(subtask)
}catch(error){
    console.error('Error creating subtask:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
}