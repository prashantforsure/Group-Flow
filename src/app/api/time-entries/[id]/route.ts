import { authOptions } from "@/lib/auth/config"
import prisma from "@/lib/db"
import { updateTimeEntrySchema } from "@/lib/validations/timeEntry"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
  
      const timeEntry = await prisma.timeEntry.findUnique({
        where: {
          id: params.id,
          userId: session.user.id
        }
      })
  
      if (!timeEntry) {
        return NextResponse.json(
          { error: 'Time entry not found' },
          { status: 404 }
        )
      }
  
      const body = await req.json()
      const validatedData = updateTimeEntrySchema.parse(body)
  
      if (validatedData.startTime || validatedData.endTime) {
        const overlappingEntry = await prisma.timeEntry.findFirst({
          where: {
            userId: session.user.id,
            id: { not: params.id },
            OR: [
              {
                startTime: {
                  lte: validatedData.startTime 
                    ? new Date(validatedData.startTime)
                    : timeEntry.startTime
                },
                endTime: {
                  gte: validatedData.startTime
                    ? new Date(validatedData.startTime)
                    : timeEntry.startTime
                }
              },
              {
                startTime: {
                  lte: validatedData.endTime
                    ? new Date(validatedData.endTime)
                    : timeEntry.endTime!
                },
                endTime: {
                  gte: validatedData.endTime
                    ? new Date(validatedData.endTime)
                    : timeEntry.endTime!
                }
              }
            ]
          }
        })
  
        if (overlappingEntry) {
          return NextResponse.json(
            { error: 'Overlapping time entry exists' },
            { status: 400 }
          )
        }
      }
  
      const updatedTimeEntry = await prisma.timeEntry.update({
        where: {
          id: params.id
        },
        data: {
          startTime: validatedData.startTime
            ? new Date(validatedData.startTime)
            : undefined,
          endTime: validatedData.endTime
            ? new Date(validatedData.endTime)
            : undefined,
          description: validatedData.description
        }
      })
  
      return NextResponse.json(updatedTimeEntry)
    } catch (error) {
      
      console.error('Error updating time entry:', error)
      return NextResponse.json(
        { error: 'Failed to update time entry' },
        { status: 500 }
      )
    }
  }
  
  export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
  
      const timeEntry = await prisma.timeEntry.findUnique({
        where: {
          id: params.id,
          userId: session.user.id
        }
      })
  
      if (!timeEntry) {
        return NextResponse.json(
          { error: 'Time entry not found' },
          { status: 404 }
        )
      }
  
      await prisma.timeEntry.delete({
        where: {
          id: params.id
        }
      })
  
      return new NextResponse(null, { status: 204 })
    } catch (error) {
      console.error('Error deleting time entry:', error)
      return NextResponse.json(
        { error: 'Failed to delete time entry' },
        { status: 500 }
      )
    }
  }