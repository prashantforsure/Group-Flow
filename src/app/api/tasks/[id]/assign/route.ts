import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { AssignTaskSchema } from "@/lib/validations/tasks";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params : { id : string } } ){
try{
    const session = await getServerSession(authOptions);
    if(!session?.user?.email){
        return NextResponse.json({
            message: ' unauthorized'
        })
    }
    const body = await req.json();
    const { assigneeId, role } = AssignTaskSchema.parse(body);
    const task = await prisma.task.findUnique({
        where: { id: params.id },
        include: { group: true }
    })
    if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      const [assignerMember, assigneeMember] = await Promise.all([
        prisma.groupMember.findFirst({
          where: {
            groupId: task.groupId,
            userId: session.user.id,
          }
        }),
        prisma.groupMember.findFirst({
          where: {
            groupId: task.groupId,
            userId: assigneeId,
          }
        })
      ]);
      if (!assignerMember || !assigneeMember) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      const assignment = await prisma.taskAssignment.create({
        data: {
          task: { connect: { id: params.id } },
          assignee: { connect: { id: assigneeId } },
          role,
        },
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
      });
      return NextResponse.json(assignment);
}catch(error){
  console.log(error)
    return NextResponse.json({ error: 'Internal server error' },
        { status: 500 });
}
}