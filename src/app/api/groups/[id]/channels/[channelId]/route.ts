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

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        group: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    if (channel.groupId !== groupId) {
      return NextResponse.json({ error: 'Channel does not belong to the specified group' }, { status: 400 })
    }

    // Check if the user is a member of the group
    if (channel.group.members.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json(channel)
  } catch (error) {
    console.error('Error fetching channel details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId, channelId } = params
    const { name, description, type } = await req.json()

    // Check if the user is an admin of the group
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
        role: 'ADMIN',
      },
    })

    if (!groupMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const updatedChannel = await prisma.channel.update({
      where: { id: channelId },
      data: {
        name,
        description,
        type,
      },
    })

    return NextResponse.json(updatedChannel)
  } catch (error) {
    console.error('Error updating channel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId, channelId } = params

    // Check if the user is an admin of the group
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
        role: 'ADMIN',
      },
    })

    if (!groupMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if the channel exists and belongs to the group
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    })

    if (!channel || channel.groupId !== groupId) {
      return NextResponse.json({ error: 'Channel not found or does not belong to the specified group' }, { status: 404 })
    }

    // Delete the channel
    await prisma.channel.delete({
      where: { id: channelId },
    })

    return NextResponse.json({ message: 'Channel deleted successfully' })
  } catch (error) {
    console.error('Error deleting channel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}