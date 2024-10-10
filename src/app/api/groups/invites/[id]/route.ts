import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { respondToInviteSchema } from "@/lib/validations/group";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const body = await request.json();
      const validatedData = respondToInviteSchema.parse(body);
  
      const invitation = await prisma.groupInvitation.findUnique({
        where: { id: params.id },
        include: { group: true },
      });
  
      if (!invitation) {
        return NextResponse.json(
          { error: "Invitation not found" },
          { status: 404 }
        );
      }
  
      if (invitation.email !== session.user.email) {
        return NextResponse.json(
          { error: "This invitation is not for you" },
          { status: 403 }
        );
      }
  
      if (invitation.status !== 'PENDING') {
        return NextResponse.json(
          { error: "This invitation has already been responded to" },
          { status: 400 }
        );
      }
  
      const updatedInvitation = await prisma.$transaction(async (prisma) => {
        const updated = await prisma.groupInvitation.update({
          where: { id: params.id },
          //@ts-expect-error This is expected to fail because the function is not defined in the current scope
          data: { status: validatedData.status },
        });
  
        if (validatedData.status === 'ACCEPTED') {
          await prisma.groupMember.create({
            data: {
              group: { connect: { id: invitation.groupId } },
              //@ts-expect-error This is expected to fail because the function is not defined in the current scope
              user: { connect: { email: session.user.email } },
              role: invitation.role,
            },
          });
        }
  
        return updated;
      });
  
      return NextResponse.json(updatedInvitation);
    } catch (error) {
      
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }