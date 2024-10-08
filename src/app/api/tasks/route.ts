import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from '@prisma/client';


export async function GET(req: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { searchParams } = new URL(req.url);
      const groupId = searchParams.get('groupId');
      const status = searchParams.get('status') as TaskStatus | null;
      const priority = searchParams.get('priority') as TaskPriority | null;
      const assigneeId = searchParams.get('assigneeId');
  
      const whereConditions: Prisma.TaskWhereInput[] = [
        {
          group: {
            members: {
              some: { userId: session.user.id }
            }
          }
        }
      ];
  
      if (groupId) whereConditions.push({ groupId });
      if (status && Object.values(TaskStatus).includes(status)) {
        whereConditions.push({ status });
      }
      if (priority && Object.values(TaskPriority).includes(priority)) {
        whereConditions.push({ priority });
      }
      if (assigneeId) whereConditions.push({ assignments: { some: { assigneeId } } });
  
      const where: Prisma.TaskWhereInput = {
        AND: whereConditions
      };
  
      const tasks = await prisma.task.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          },
          assignments: {
            include: {
              assignee: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                }
              }
            }
          },
          group: true,
        },
        orderBy: { createdAt: 'desc' },
      });
  
      return NextResponse.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }