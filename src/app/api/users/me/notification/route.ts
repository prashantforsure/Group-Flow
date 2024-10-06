import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const session = await getServerSession(authOptions)
        if(!session?.user?.email){
            return NextResponse.json({
                message: "session not found"
            })
        }
        const notifications = await prisma.notification.findMany({
            where: {
                user: {
                    email: session.user.email
                }
            },
            orderBy: {
                createdAt: 'desc',
              },
              select: {
                id: true,
                type: true,
                content: true,
                isRead: true,
                createdAt: true,
              },
        })
        
    }
}