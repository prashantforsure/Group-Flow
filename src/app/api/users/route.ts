
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({
                message: "unauthenticated"
            }, {
                status: 401
            })
        }
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
            }
        })
        return NextResponse.json({
            users
        }, {
            status: 200
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