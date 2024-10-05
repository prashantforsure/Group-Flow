import { verifyEmailSchema } from "@/lib/auth/validation";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try{
        const body = await req.json();
        const { token } =  verifyEmailSchema.parse(body);

        const user = await prisma.user.findFirst({
        where: {
        verificationToken: token
        }
        })
        if(!user){
            return NextResponse.json({
                message: "user does not exist"
            }, {
                status: 400
            })
        }
        await prisma.user.update({
            where: {
                id: user.id
            }, 
            data: {
                isVerified: true,
                verificationToken: null,
            }
        })
        return NextResponse.json({
            message: "email verified successfully"
        }, {
            status: 200
        })
    }catch(error){
        console.log(error);
        return NextResponse.json({
            error: "internal server error"
        }, {
            status: 500
        })
    }
}