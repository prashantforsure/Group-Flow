import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config';
import prisma from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; channelId: string; messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId, channelId, messageId } = params
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

    // Check if the message exists and belongs to the user
    const existingMessage = await prisma.message.findFirst({
      where: {
        id: messageId,
        channelId,
        channel: {
          groupId,
        },
        senderId: session.user.id,
      },
      include: {
        mentions: {
          select: { id: true },
        },
      },
    })

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found or access denied' }, { status: 404 })
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        updatedAt: new Date(),
        mentions: {
          set: mentionedUserIds?.map((id: string) => ({ id })) || [],
        },
        attachments: {
          set: attachmentIds?.map((id: string) => ({ id })) || [],
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
    })

    // Create notifications for newly mentioned users
    const newMentions = mentionedUserIds?.filter(
      (id: string) => !existingMessage.mentions.some((mention) => mention.id === id)
    )

    if (newMentions && newMentions.length > 0) {
      await prisma.notification.createMany({
        data: newMentions.map((userId: string) => ({
          type: 'MENTION',
          content: `You were mentioned in an edited message by ${session.user.name || session.user.email}`,
          userId,
          messageId: updatedMessage.id,
        })),
      })
    }

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; channelId: string; messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId, channelId, messageId } = params

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

    // Check if the message exists and belongs to the user or if the user is an admin
    const existingMessage = await prisma.message.findFirst({
      where: {
        id: messageId,
        channelId,
        channel: {
          groupId,
        },
        OR: [
          { senderId: session.user.id },
          { channel: { group: { members: { some: { userId: session.user.id, role: 'ADMIN' } } } } },
        ],
      },
    })

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found or access denied' }, { status: 404 })
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageId },
    })

    return NextResponse.json({ message: 'Message deleted successfully' })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}