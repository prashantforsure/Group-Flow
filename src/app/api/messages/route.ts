import { authOptions } from "@/lib/auth/config"
import prisma from "@/lib/db"
import { createMessageSchema } from "@/lib/validations/message"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
  
      const { searchParams } = new URL(req.url)
      const otherUserId = searchParams.get('userId')
      const limit = parseInt(searchParams.get('limit') || '50')
      const before = searchParams.get('before') // cursor for pagination
  
      if (!otherUserId) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        )
      }
      const query: any = {
        where: {
          OR: [
            {
              senderId: session.user.id,
              receiverId: otherUserId
            },
            {
              senderId: otherUserId,
              receiverId: session.user.id
            }
          ]
        },
        include: {
          sender: {
            select: {
              name: true,
              avatar: true
            }
          },
          attachments: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      }
      if (before) {
        query.cursor = {
          id: before
        }
        query.skip = 1 
      }
  
      const messages = await prisma.message.findMany(query)
  
      return NextResponse.json(messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }
  }
  

  export async function POST(req: Request) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
  
      const body = await req.json()
      const validatedData = createMessageSchema.parse(body)

      const receiver = await prisma.user.findUnique({
        where: { id: validatedData.receiverId }
      })
  
      if (!receiver) {
        return NextResponse.json(
          { error: 'Receiver not found' },
          { status: 404 }
        )
      }
  
      const message = await prisma.message.create({
        data: {
          content: validatedData.content,
          senderId: session.user.id,
          receiverId: validatedData.receiverId,
          attachments: validatedData.attachments
            ? {
                create: validatedData.attachments.map(attachment => ({
                  filename: attachment.filename,
                  fileType: attachment.fileType,
                  fileSize: attachment.fileSize,
                  url: attachment.url
                }))
              }
            : undefined
        },
        include: {
          sender: {
            select: {
              name: true,
              avatar: true
            }
          },
          attachments: true
        }
      });
      
      await prisma.notification.create({
        data: {
          userId: validatedData.receiverId,
          type: 'MENTION',
          content: `New message from ${session.user.name}`,
        }
      })
  
      return NextResponse.json(message, { status: 201 })
    } catch (error) {
      console.error('Error sending message:', error)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }
  }