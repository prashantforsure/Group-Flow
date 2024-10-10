import { registerSchema } from "@/lib/auth/validation";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
export async function POST(req: NextRequest){
    try{
        const body = await req.json();
        const validatedData = registerSchema.parse(body)

        const existingUser = await prisma.user.findFirst({
            where: {
                email: validatedData.email
            }
        })
        if(existingUser){
            return NextResponse.json({
                message: "user already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(validatedData.password, 12);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const createUser = await prisma.user.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
                name: validatedData.name,
                verificationToken,
            }
        })
        return NextResponse.json(createUser
            
        )
    }catch(error){
        console.log(error);
        return NextResponse.json({
            error: "something went wrong"
        })
    }
}