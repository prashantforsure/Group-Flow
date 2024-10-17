import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { updateMemberRoleSchema } from "@/lib/validations/group";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        message: "unauthenticated"
      }, {
        status: 401
      });
    }

    const { searchParams } = new URL(req.url);
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
      where: whereClause,
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
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id;
    const { email } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const groupMember = await prisma.groupMember.create({
      data: {
        group: { connect: { id: groupId } },
        user: { connect: { id: user.id } },
        role: 'MEMBER',
      },
    });

    return NextResponse.json({ success: true, member: groupMember });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        message: "unauthenticated"
      }, {
        status: 401
      });
    }

    const searchParams = new URL(request.url).searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        message: "userId is required"
      }, {
        status: 400
      });
    }

    const currentMember = await prisma.groupMember.findFirst({
      where: {
        groupId: params.id,
        user: { email: session.user.email },
        role: { in: ['ADMIN', 'MODERATOR'] },
      }
    });

    if (!currentMember) {
      return NextResponse.json({
        message: 'user does not have permission to remove'
      }, {
        status: 403
      });
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: params.id,
          userId: userId,
        },
      },
    });

    return NextResponse.json(
      { message: "Member removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        message: "unauthorized"
      }, {
        status: 401
      });
    }

    const searchParams = new URL(req.url).searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        message: "userId is required"
      }, {
        status: 400
      });
    }

    const body = await req.json();
    const validatedData = updateMemberRoleSchema.parse(body);

    const currentMember = await prisma.groupMember.findFirst({
      where: {
        groupId: params.id,
        user: { email: session.user.email },
        role: 'ADMIN'
      }
    });

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
          userId: userId,
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
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}