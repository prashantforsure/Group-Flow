import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { updateMemberRoleSchema } from "@/lib/validations/group";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params : { id : string } } ){
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

export async function POST(req: NextRequest, { params }: { params : { id : string } } ){
  try{
    const session = await getServerSession(authOptions);
    if(!session?.user?.email){
      return NextResponse.json({
          message: "unathenticated"
      }, {
          status: 401
      })
  }
    const body = await req.json();
    const { email, role = 'MEMBER' } = body;
    const currentMember  = await prisma.groupMember.findFirst({
      where: {
        groupId: params.id,
        user: { email: session.user.email},
        role: { in: ['ADMIN', 'MODERATOR']}
      }
    })
    if (!currentMember) {
      return NextResponse.json(
        { error: "Only admins and moderators can add members" },
        { status: 403 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId: params.id,
        user: { email },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this group" },
        { status: 400 }
      );
    }
    const member = await prisma.groupMember.create({
      data: {
        group: { connect: { id: params.id } },
        user: { connect: { email } },
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(member);
  }catch(error){
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params } : { params : { userId : string, id: string } } ){
  try{
    const session = await getServerSession(authOptions);
    if(!session?.user?.email){
      return NextResponse.json({
          message: "unathenticated"
      }, {
          status: 401
      })
  }
  const currentMember = await prisma.groupMember.findFirst({
    where: {
      groupId: params.id,
      user: { email: session.user.email },
      role: { in: ['ADMIN', 'MODERATOR'] },
    }
  })
  if(!currentMember){
    return NextResponse.json({
      message : ' user does not have permission to remove'
    }, {
      status: 403
    })
  }
  await prisma.groupMember.delete({
    where: {
      groupId_userId: {
        groupId: params.id,
        userId: params.userId,
      },
    },
  })
  return NextResponse.json(
    { message: "Member removed successfully" },
    { status: 200 }
  );
  }catch(error){
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string; userId: string } } ){
  try{
    const session = await getServerSession(authOptions);
    if(!session?.user?.email){
      return NextResponse.json({
        message: " unauthorized"
      }, {
        status: 401
      })
    }
    const body = await req.json();
    const validatedData =  updateMemberRoleSchema.parse(body);
    const currentMember = await prisma.groupMember.findFirst({
      where: {
        groupId: params.id,
        user: { email: session.user.email },
        role: 'ADMIN'
      }
    })
    if (!currentMember) {
      return NextResponse.json(
        { error: "Only admins can update member roles" },
        { status: 403 }
      );
    }
    const updatedMember = await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId: params.id,
          userId: params.userId,
        },
      },
      data: {
        role: validatedData.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMember);
  }catch(error){
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

}