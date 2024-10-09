import { authOptions } from "@/lib/auth/config"
import prisma from "@/lib/db"
import { createTimeEntrySchema } from "@/lib/validations/timeEntry"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const { searchParams } = new URL(req.url)
      const taskId = searchParams.get('taskId')
      const startDate = searchParams.get('startDate')
      const endDate = searchParams.get('endDate')
  
      const filters: any = {
        userId: session.user.id
      }
  
      if (taskId) {
        filters.taskId = taskId
      }
  
      if (startDate && endDate) {
        filters.startTime = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
  
      const timeEntries = await prisma.timeEntry.findMany({
        where: filters,
        include: {
          task: {
            select: {
              title: true,
              group: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          startTime: 'desc'
        }
      })
  
      return NextResponse.json(timeEntries)
    } catch (error) {
      console.error('Error fetching time entries:', error)
      return NextResponse.json(
        { error: 'Failed to fetch time entries' },
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
      const validatedData = createTimeEntrySchema.parse(body)
  
      const task = await prisma.task.findFirst({
        where: {
          id: validatedData.taskId,
          group: {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      })
  
      if (!task) {
        return NextResponse.json(
          { error: 'Task not found or access denied' },
          { status: 404 }
        )
      }
  
      const overlappingEntry = await prisma.timeEntry.findFirst({
        where: {
          userId: session.user.id,
          OR: [
            {
              startTime: {
                lte: new Date(validatedData.startTime)
              },
              endTime: {
                gte: new Date(validatedData.startTime)
              }
            },
            {
              startTime: {
                lte: validatedData.endTime ? new Date(validatedData.endTime) : new Date()
              },
              endTime: {
                gte: validatedData.endTime ? new Date(validatedData.endTime) : new Date()
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
  
      const timeEntry = await prisma.timeEntry.create({
        data: {
          userId: session.user.id,
          taskId: validatedData.taskId,
          startTime: new Date(validatedData.startTime),
          endTime: validatedData.endTime ? new Date(validatedData.endTime) : null,
          description: validatedData.description
        }
      })
  
      return NextResponse.json(timeEntry, { status: 201 })
    } catch (error) {
      
      console.error('Error creating time entry:', error)
      return NextResponse.json(
        { error: 'Failed to create time entry' },
        { status: 500 }
      )
    }
  }