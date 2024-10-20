import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config';
import prisma from '@/lib/db';


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId, channelId } = params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const cursor = searchParams.get('cursor')

    // Check if the user is a member of the group
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
    })

    if (!groupMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: {
        channelId,
        channel: {
          groupId,
        },
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        mentions: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        attachments: true,
      },
    })

    const nextCursor = messages.length === limit ? messages[messages.length - 1].id : null

    return NextResponse.json({
      messages,
      nextCursor,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId, channelId } = params
    const { content, mentionedUserIds, attachmentIds } = await req.json()

    // Check if the user is a member of the group
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
    })

    if (!groupMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        channelId,
        receiverId: channelId, // Add this line if you want to use channelId as receiverId
        // or set it to some other appropriate value
        mentions: {
          connect: mentionedUserIds?.map((id: string) => ({ id })) || [],
        },
        attachments: {
          connect: attachmentIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        mentions: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        attachments: true,
      },
    });
    // Create notifications for mentioned users
    if (mentionedUserIds && mentionedUserIds.length > 0) {
      await prisma.notification.createMany({
        data: mentionedUserIds.map((userId: string) => ({
          type: 'MENTION',
          content: `You were mentioned in a message by ${session.user.name || session.user.email}`,
          userId,
          messageId: newMessage.id,
        })),
      })
    }

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}