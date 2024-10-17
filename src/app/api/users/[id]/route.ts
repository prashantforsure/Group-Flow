import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET( req: NextRequest,{ params }: { params: { id: string } }){
    try{
        const session = await getServerSession(authOptions)
        if(session){
            return NextResponse.json({
                message: "session not found"
            }, {
                status: 405
            })
        }
        const user = await prisma.user.findUnique({
            where: {
                id: params.id
            }, 
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
            }
        })
        if(!user){
            return NextResponse.json({
                messsage: 'user not found'
            }, {
                status: 404
            })
        }
        return NextResponse.json({
            user
        }, {
            status:200
        })
    }catch(error){
        console.log(error)
        return NextResponse.json({
            error: "internal error"
        }, {
            status: 500
        })
    }
}