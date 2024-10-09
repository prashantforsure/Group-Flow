import { authOptions } from "@/lib/auth/config"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
  
      const message = await prisma.message.findFirst({
        where: {
          id: params.id,
          receiverId: session.user.id
        }
      })
  
      if (!message) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        )
      }
  
      const updatedMessage = await prisma.message.update({
        where: {
          id: params.id
        },
        data: {
          readAt: new Date()
        }
      })
  
      return NextResponse.json(updatedMessage)
    } catch (error) {
      console.error('Error marking message as read:', error)
      return NextResponse.json(
        { error: 'Failed to mark message as read' },
        { status: 500 }
      )
    }
  }