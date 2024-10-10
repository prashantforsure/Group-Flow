import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(){
    try{
        const session = await getServerSession(authOptions)
        if(!session?.user?.email){
            return NextResponse.json({
                message: 'unauthenticated'
            }, {
                status: 401
            })
        }
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }, select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
                workHoursPerWeek: true,
                timezone: true,
                isVerified: true,
                twoFactorEnabled: true,
            }
            
        })
        if (!user) {
            return NextResponse.json({ error: "User not found" },
                 { status: 404 });
          }
          return NextResponse.json({
            user
          }, {
            status: 200
          })
    }catch(error){
        console.log(error)
        return NextResponse.json({
            error: "internal error"
        })
    }
}

export async function PUT(req: NextRequest){
    try{
        const session = await getServerSession(authOptions)
        if(!session?.user?.email){
            return NextResponse.json({
                message: 'unauthenticated'
            }, {
                status: 401
            })
        }
        const body = await req.json();
        const { name, timezone, workHoursPerWeek, image } = body;
        const updateUser = await prisma.user.update({
            where: {
                   email: session.user.email
            },
            data: {
                name,
                timezone, 
                workHoursPerWeek, 
                image
            },
             select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
                workHoursPerWeek: true,
                timezone: true,
                isVerified: true,
                twoFactorEnabled: true,
            }
        })
        return NextResponse.json({
            updateUser
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