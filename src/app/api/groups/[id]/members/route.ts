import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params : { id : string }}){
 try{
    const session = await getServerSession(authOptions);
    if(!session?.user?.email){
        return NextResponse.json({
            message: "unathenticated"
        }, {
            status: 401
        })
    }
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    
    const whereClause: any = {
        groupId: params.id,
      };
  
    if (role) {
        whereClause.role = role;
      }

    if (search) {
        whereClause.user = {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        };
      }
    const members = await prisma.groupMember.findMany({
        where : whereClause,
        include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              },
            },
        },
        orderBy: {
            joinedAt: 'desc',
        }
    })
    return NextResponse.json(members);
 }catch(error){
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
 }
}