import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { createInviteSchema } from "@/lib/validations/group";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const body = await request.json();
      const validatedData = createInviteSchema.parse(body);
  
      // Check if user has permission to send invites
      const currentMember = await prisma.groupMember.findFirst({
        where: {
          groupId: params.id,
          user: { email: session.user.email },
          role: { in: ['ADMIN', 'MODERATOR'] },
        },
      });
  
      if (!currentMember) {
        return NextResponse.json(
          { error: "Only admins and moderators can send invites" },
          { status: 403 }
        );
      }
  
      const invite = await prisma.groupInvitation.create({
        data: {
          group: { connect: { id: params.id } },
          email: validatedData.email,
          role: validatedData.role || 'MEMBER',
          message: validatedData.message,
          inviter: { connect: { email: session.user.email } },
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          inviter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
  
      // TODO: Send email notification
  
      return NextResponse.json(invite);
    } catch (error) {
      console.error("Error creating invitation:", error);
      
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
  