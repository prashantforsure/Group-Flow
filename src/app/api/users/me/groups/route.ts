import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const session = await getServerSession(authOptions)
        if(!session?.user?.email){
            return NextResponse.json({
                message: "unauthorized"
            }, {
                status: 401
            })
        }
        const groups = await prisma.group.findMany({
            where: {
                OR: [
                  { owner: { email: session.user.email } },
                  { members: { some: { user: { email: session.user.email } } } },
                ],
              },
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
                members: {
                  select: {
                    role: true,
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    tasks: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
        })
        return NextResponse.json({groups})
    }catch(error){
        return NextResponse.json({
            error: 'internal server error'
        })
    }
}