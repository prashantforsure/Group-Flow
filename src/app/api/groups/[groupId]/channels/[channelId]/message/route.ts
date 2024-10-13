import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth/config';

export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string; channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, channelId } = params;

    const messages = await prisma.message.findMany({
      where: {
        // Assuming you want to filter messages by the receiver's ID (which could be the channel)
        receiverId: channelId,
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
    { params }: { params: { groupId: string; channelId: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const { groupId, channelId } = params;
      const { content } = await req.json();
  
      if (!content) {
        return NextResponse.json({ error: "Message content is required" }, { status: 400 });
      }
  
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: { group: { include: { members: true } } },
      });
  
      if (!channel) {
        return NextResponse.json({ error: "Channel not found" }, { status: 404 });
      }
  
      if (channel.type === 'ANNOUNCEMENTS') {
        const isAdmin = channel.group.members.some(member => 
          member.userId === session.user.id && member.role === 'ADMIN'
        );
  
        if (!isAdmin) {
          return NextResponse.json({ error: "Only admins can post in announcement channels" }, { status: 403 });
        }
      }
  
      const message = await prisma.message.create({
        //@ts-expect-error there is some type 
        data: {
          content,
          sender: { connect: { email: session.user.email } },
          channel: { connect: { id: channelId } },
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
  
export async function DELETE(
  req: NextRequest,
  { params }: { params: { groupId: string; channelId: string; messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, channelId, messageId } = params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { 
        sender: true,
        receiver: true,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const groupMember = await prisma.groupMember.findFirst({
      where: {
        group: { id: groupId },
        user: { email: session.user.email },
      },
    });

    const isAuthor = message.sender.email === session.user.email;
    const isAdmin = groupMember?.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "You don't have permission to delete this message" }, { status: 403 });
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}