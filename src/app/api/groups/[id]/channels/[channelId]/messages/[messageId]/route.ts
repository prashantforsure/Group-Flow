import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth/config';

export async function DELETE(
  req: NextRequest,{ params }: { params: { id: string; channelId: string; messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "log in karle mere bhai" }, { status: 401 });
    }

    const { id, channelId, messageId } = params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { 
        sender: true,
        channel: { 
          include: { 
            group: { 
              include: { 
                members: { 
                  include: {
                    user: true
                  },
                  where: { 
                    user: { 
                      email: session.user.email 
                    } 
                  } 
                } 
              } 
            } 
          } 
        }
      },
    });

    if (!message) {
      return NextResponse.json({ error: "message he nhi hai kya delete karoge" },
        { status: 404 });
    }

    const isAuthor = message.sender.email === session.user.email;
    const isAdmin = message.channel.group.members[0]?.role === 'ADMIN';

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

//bc kitne bt dia h na yeah code