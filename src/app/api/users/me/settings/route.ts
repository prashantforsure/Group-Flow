import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest){
    try{
        const session = await getServerSession(authOptions)
        if(!session?.user?.email){
            return NextResponse.json({
                message: "session not found"
            }, {
                status: 401
            })
        }
        const body = await req.json();
        const { twoFactorEnabled, workHoursPerWeek, timezone } = body;

        const updateSettings = await prisma.user.update({
            where: {
                email: session.user.email
            }, data: {
                twoFactorEnabled,
                workHoursPerWeek,
                timezone,
            }, select: {
                id: true,
                twoFactorEnabled: true,
                workHoursPerWeek: true,
                timezone: true,
            }
        })
        return NextResponse.json({
            updateSettings
        }, {
            status: 200
        })
    }catch(error){
        return NextResponse.json({
            error: "internal error"
        }, {
            status: 500
        })
    }
}