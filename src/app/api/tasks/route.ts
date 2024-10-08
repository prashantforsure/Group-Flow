import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Prisma,TaskStatus, TaskPriority } from '@prisma/client';
import { TaskCreateSchema } from "@/lib/validations/tasks";


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


 export async function POST(req: NextRequest){
    try{
        const session = await getServerSession(authOptions)
        if(!session?.user){
            return NextResponse.json({
                message: 'unauthorized'
            }, {
                status: 401
            })
        }
        const body = req.json()
        const { title, description, priority, status, dueDate, estimatedHours, tags, assigneeIds, groupId } = TaskCreateSchema.parse(body)

        const groupMember = await prisma.groupMember.findFirst({
            where: {
                groupId: groupId,
                userId: session.user.id,
            }
        })
        if (!groupMember) {
          return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
        }

        const task = await prisma.task.create({
          data: {
            title: title,
            description: description,
            priority: priority,
            status: status,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            estimatedHours: estimatedHours,
            tags: tags,
            group: { connect: { id: groupId } },
            creator: { connect: { id: session.user.id } },
            assignments: assigneeIds ? {
              create: assigneeIds.map(assigneeId => ({
                assignee: { connect: { id: assigneeId } },
                role: 'RESPONSIBLE'
              }))
            } : undefined,
          },
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
          }
        });
    return NextResponse.json(task)
    }catch(error){
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
 }