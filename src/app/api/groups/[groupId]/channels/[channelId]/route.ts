
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth/config';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { groupId: string; channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, channelId } = params;

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: { 
        group: { 
          include: { 
            members: { 
              where: { user: { email: session.user.email } } 
            } 
          } 
        } 
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const isAdmin = channel.group.members[0]?.role === 'ADMIN';

    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can delete channels" }, { status: 403 });
    }

    await prisma.channel.delete({
      where: { id: channelId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting channel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}