import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const invites = await prisma.groupInvitation.findMany({
        where: {
          email: session.user.email,
          status: 'PENDING',
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              description: true,
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
          inviter: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      return NextResponse.json(invites);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
  