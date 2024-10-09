import { authOptions } from "@/lib/auth/config"
import prisma from "@/lib/db"
import { createDocumentSchema } from "@/lib/validations/document"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
  
      const { searchParams } = new URL(req.url)
      const groupId = searchParams.get('groupId')
      const search = searchParams.get('search')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const skip = (page - 1) * limit
  
      const filters: any = {
        group: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
  
      if (groupId) {
        filters.groupId = groupId
      }
  
      if (search) {
        filters.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      }
  
      const totalCount = await prisma.document.count({
        where: filters
      })
  
      
      const documents = await prisma.document.findMany({
        where: filters,
        include: {
          group: {
            select: {
              name: true
            }
          },
          attachments: true
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: limit
      })
  
      return NextResponse.json({
        documents,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          current: page,
          limit
        }
      })
    } catch (error) {
      console.error('Error fetching documents:', error)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
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
      const validatedData = createDocumentSchema.parse(body)
  
      
      const groupMember = await prisma.groupMember.findFirst({
        where: {
          groupId: validatedData.groupId,
          userId: session.user.id
        }
      })
  
      if (!groupMember) {
        return NextResponse.json(
          { error: 'Group access denied' },
          { status: 403 }
        )
      }
  
      
      const document = await prisma.document.create({
        data: {
          title: validatedData.title,
          content: validatedData.content,
          groupId: validatedData.groupId,
          version: 1,
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
          attachments: true,
          group: {
            select: {
              name: true
            }
          }
        }
      });
  
      
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'DOCUMENT_CREATED',
          details: {
            documentId: document.id,
            documentTitle: document.title
          }
        }
      })
  
      return NextResponse.json(document, { status: 201 })
    } catch (error) {
     
      console.error('Error creating document:', error)
      return NextResponse.json(
        { error: 'Failed to create document' },
        { status: 500 }
      )
    }
  }