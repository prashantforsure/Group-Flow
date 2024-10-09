// import { authOptions } from "@/lib/auth/config"
// import prisma from "@/lib/db"
// import { getServerSession } from "next-auth"
// import { NextResponse } from "next/server"

// export async function GET(
//     req: Request,
//     { params }: { params: { id: string } }
//   ) {
//     try {
//       const session = await getServerSession(authOptions)
//       if (!session?.user) {
//         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//       }
  
//       const { searchParams } = new URL(req.url)
//       const limit = parseInt(searchParams.get('limit') || '50')
//       const before = searchParams.get('before')
  
//       const channel = await prisma.channel.findFirst({
//         where: {
//           id: params.id,
//           group: {
//             members: {
//               some: {
//                 userId: session.user.id
//               }
//             }
//           }
//         }
//       })
  
//       if (!channel) {
//         return NextResponse.json(
//           { error: 'Channel not found or access denied' },
//           { status: 404 }
//         )
//       }
  
//       const query: any = {
//         where: {
//           channelId: params.id
//         },
//         include: {
//           sender: {
//             select: {
//               name: true,
//               avatar: true
//             }
//           },
//           attachments: true
//         },
//         orderBy: {
//           createdAt: 'desc'
//         },
//         take: limit
//       }
  
//       if (before) {
//         query.cursor = {
//           id: before
//         }
//         query.skip = 1
//       }
  
//       const messages = await prisma.channelMessage.findMany(query)
  
//       return NextResponse.json(messages)
//     } catch (error) {
//       console.error('Error fetching channel messages:', error)
//       return NextResponse.json(
//         { error: 'Failed to fetch channel messages' },
//         { status: 500 }
//       )
//     }
//   }
  
//   export async function POST(
//     req: Request,
//     { params }: { params: { id: string } }
//   ) {
//     try {
//       const session = await getServerSession(authOptions)
//       if (!session?.user) {
//         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//       }
  
//       const body = await req.json()
//       const { content, attachments } = body
  
//       if (!content?.trim()) {
//         return NextResponse.json(
//           { error: 'Message content is required' },
//           { status: 400 }
//         )
//       }
//       const channel = await prisma.channel.findFirst({
//         where: {
//           id: params.id,
//           group: {
//             members: {
//               some: {
//                 userId: session.user.id
//               }
//             }
//           }
//         },
//         include: {
//           group: true
//         }
//       })
  
//       if (!channel) {
//         return NextResponse.json(
//           { error: 'Channel not found or access denied' },
//           { status: 404 }
//         )
//       }
  
//       const message = await prisma.channelMessage.create({
//         data: {
//           content,
//           channelId: params.id,
//           senderId: session.user.id,
//           attachments: attachments
//             ? {
//                 createMany: {
//                   data: attachments
//                 }
//               }
//             : undefined
//         },
//         include: {
//           sender: {
//             select: {
//               name: true,
//               avatar: true
//             }
//           },
//           attachments: true
//         }
//       })
  
//       await prisma.notification.createMany({
//         data: channel.group.members.map(member => ({
//           userId: member.userId,
//           type: 'MENTION',
//           content: `New message in ${channel.name} from ${session.user.name}`,
//         })).filter(notification => notification.userId !== session.user.id)
//       })
  
//       return NextResponse.json(message, { status: 201 })
//     } catch (error) {
//       console.error('Error sending channel message:', error)
//       return NextResponse.json(
//         { error: 'Failed to send channel message' },
//         { status: 500 }
//       )
//     }
//   }