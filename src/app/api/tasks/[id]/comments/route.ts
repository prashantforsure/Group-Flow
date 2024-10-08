import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
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
                attachments: true
            },
            

        }
    })
}
}