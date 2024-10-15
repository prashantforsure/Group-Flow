import { authOptions } from "@/lib/auth/config"
import prisma from "@/lib/db"
import { createChannelSchema } from "@/lib/validations/channel"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      )
    }

    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: session.user.id
      }
    })

    if (!groupMember) {
      return NextResponse.json(
        { error: 'Group access denied' },
        { status: 403 }
      )
    }

    const channels = await prisma.channel.findMany({
      where: {
        groupId: id
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()
    const validatedData = createChannelSchema.parse({ ...body, groupId: id })

    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: session.user.id,
        role: {
          in: ['ADMIN', 'MODERATOR']
        }
      }
    })

    if (!groupMember) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const channel = await prisma.channel.create({
      data: validatedData
    })

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CHANNEL_CREATED',
        details: {
          channelId: channel.id,
          channelName: channel.name,
          groupId: channel.groupId
        }
      }
    })

    return NextResponse.json(channel, { status: 201 })
  } catch (error) {
    console.error('Error creating channel:', error)
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    )
  }
}