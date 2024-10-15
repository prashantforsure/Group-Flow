import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth/config';

export async function GET(
  req: NextRequest,{ params }: { params: { id: string; channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, channelId } = params;

    const messages = await prisma.message.findMany({
      where: {
        channelId: channelId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauth" }, { status: 401 });
    }

    const { id, channelId } = params;
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: { 
        group: { 
          include: { 
            members: {
              include: {
                user: true
              }
            } 
          } 
        } 
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "no channel found" }, { status: 404 });
    }

    if (channel.type === 'ANNOUNCEMENTS') {
      const isAdmin = channel.group.members.some(member => 
        member.user.email === session.user.email && member.role === 'ADMIN'
      );

      if (!isAdmin) {
        return NextResponse.json({ error: "Only admins can post in announcement channels" }, { status: 403 });
      }
    }

    const message = await prisma.message.create({
      data: {
        content,
        channelId,
        senderId: session.user.id!,
        receiverId: channel.group.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}