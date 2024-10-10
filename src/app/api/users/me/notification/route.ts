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
            }, {
                status: 401
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
         if(!notifications){
            return NextResponse.json({
                message: "notification not found"
            }, {
                status: 404
            })
         } 
         return NextResponse.json({
            notifications
         })
    }
    catch(error){
        console.log(error)
        return NextResponse.json({
            error: "internal error"
        }, {
            status: 500
        })
    }
}