import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { updateGroupSchema } from "@/lib/validations/group";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
export async function GET(req: NextRequest,  { params }: { params: { id: string } }){
    try{
       const session = await getServerSession(authOptions)
       if(!session?.user?.email){
        return NextResponse.json({
            message: "unauthorized"
        },{
            status: 401
        })
       }
       const group = await prisma.group.findUnique({
        where: { id: params.id },
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
            joinedAt: true,
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
        channels: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
          take: 5,
          orderBy: {
            updatedAt: 'desc',
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
            channels: true,
          },
        },
      },
       })

       if(!group){
        return NextResponse.json({
            message: "group does not exist"
        },{
            status: 404
        })
       }
       const isMember = group.members.some(
        member => member.user.email === session.user.email
      );
      const isOwner = group.owner.email === session.user.email;
  
      if (!isMember && !isOwner && group.visibility === 'PRIVATE') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      return NextResponse.json(group);
    }catch(error){
        console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    }
}

export async function PUT(req: NextRequest, { params } : { params: { id : string }}){
    try{
       const session = await getServerSession(authOptions);
       if(!session?.user?.email){
        return NextResponse.json({
            message: "unauthorized"
        },{
            status: 401
        })
       }
       const group = await prisma.group.findUnique({
        where: { id: params.id },
        include: {
        members: {
          where: {
            user: { email: session.user.email },
          },
        },
      },
       })
       if(!group){
        return NextResponse.json({
            message: "group does not exist"
        }, {
            status: 404
        })
       }
       const isOwner = group.ownerId === session.user.id;
       const isAdmin = group.members.some(member => member.role === 'ADMIN');
       if(!isOwner && !isAdmin){
        return NextResponse.json({
            message: "Only group owners and admins can update group settings"
        }, {
            status: 403
        })
       }
       const body = await req.json();
       const validatedData = updateGroupSchema.parse(body)
       const groupUpdate = await prisma.group.update({
        where: {
            id: params.id
        }, 
        data: validatedData,
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
        }
       })
       return NextResponse.json({
        groupUpdate
       }, {
        status: 200
       })
    }catch(error){
        if (error instanceof ZodError) {
            return NextResponse.json(
              { error: "Invalid input", details: error.errors },
              { status: 400 }
            );
          }
          return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
          );
    }
}
