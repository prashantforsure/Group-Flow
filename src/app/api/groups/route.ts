import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const search = searchParams.get('search');
      const visibility = searchParams.get('visibility');
  
      const whereClause = {
        OR: [
          { owner: { email: session.user.email } },
          { members: { some: { user: { email: session.user.email } } } },
        ],
      };
  
      if (search) {
        whereClause.OR = [
          // @ts-expect-error This is expected to fail because the function is not defined in the current scope
          { name: { contains: search, mode: 'insensitive' } },
          // @ts-expect-error This is expected to fail because the function is not defined in the current scope
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
  
      if (visibility) {
        // @ts-expect-error This is expected to fail because the function is not defined in the current scope
        whereClause.visibility = visibility;
      }
  
      const [groups, total] = await Promise.all([
        prisma.group.findMany({
          where: whereClause,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            members: {
              select: {
                role: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
            _count: {
              select: {
                tasks: true,
                members: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.group.count({ where: whereClause }),
      ]);
  
      return NextResponse.json({
        groups,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit,
        },
      });
    } catch (error) {
      console.error("Error fetching groups:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
  
  export async function POST(req: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const { name , description } = await req.json();
      
      if (!name || !description) {
        return NextResponse.json({ error: "Name and description are required" }, { status: 400 });
      }
      const group = await prisma.group.create({
        data: {
          name,
          description,
          owner: {
            connect: {
              email: session.user.email,
            },
          },
          members: {
            create: {
              user: {
                connect: {
                  email: session.user.email,
                },
              },
              role: 'ADMIN',
            },
          },
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          members: {
            select: {
              role: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });
  
      
      await prisma.channel.createMany({
        data: [
          {
            name: 'General',
            description: 'General discussion channel',
            type: 'GENERAL',
            groupId: group.id,
          },
          {
            name: 'Announcements',
            description: 'Important announcements channel',
            type: 'ANNOUNCEMENTS',
            groupId: group.id,
          },
        ],
      });
  
      return NextResponse.json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }