import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { StatusUpdateSchema } from "@/lib/validations/tasks";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params } : { params : { id : string } } ){
    try{
        const session = await getServerSession(authOptions);
        if(!session?.user?.email){
            return NextResponse.json({
                message: " unauth"
            }, {
                status:401
            })
        }
        const body = await req.json();
        const { status } = StatusUpdateSchema.parse(body);
        const task = await prisma.task.findUnique({
           where:{
            id: params.id
           },
           include: {group: true}
        })
        
        if (!task) {
         return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }
        const groupMember = await prisma.groupMember.findFirst({
            where: {
                groupId: task.groupId,
                userId: session.user.id
            }
        })
        if (!groupMember) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }
          const updatedTask = await prisma.task.update({
            where: { id: params.id },
            data: {
              status,
              completedAt: status === 'COMPLETED' ? new Date() : null
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
          return NextResponse.json(updatedTask)
    }catch(error){
        console.error('Error updating task status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}