import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth/config';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupId = params.id;

    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: groupId,
        user: {
          email: session.user.email
        }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "You are not a member of this group" }, { status: 403 });
    }

    const channels = await prisma.channel.findMany({
      where: {
        groupId: groupId
      },
      orderBy: {
        type: 'desc' 
      }
    });

    return NextResponse.json(channels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupId = params.id;
    const { name, description } = await req.json();

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 });
    }

    // Check if the user is a member of the group and has permission to create channels
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: groupId,
        user: {
          email: session.user.email
        },
        role: {
          in: ['ADMIN', 'MODERATOR'] // Adjust based on your role system
        }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "You don't have permission to create channels in this group" }, { status: 403 });
    }

    const newChannel = await prisma.channel.create({
      data: {
        name,
        description,
        group: {
          connect: {
            id: groupId
          }
        }
      }
    });

    return NextResponse.json(newChannel);
  } catch (error) {
    console.error("Error creating channel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}