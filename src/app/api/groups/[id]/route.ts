import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { updateGroupSchema } from "@/lib/validations/group";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const groupId = params.id

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check if the user is a member of the group
    const isMember = group.members.some(member => member.user.id === session.user.id)
    if (!isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const formattedGroup = {
      id: group.id,
      name: group.name,
      description: group.description,
      isArchived: group.isArchived,
      visibility: group.visibility,
      maxMembers: group.maxMembers,
      settings: group.settings,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      owner: {
        id: group.owner.id,
        name: group.owner.name || '',
        email: group.owner.email,
        avatar: group.owner.avatar || '',
      },
      members: group.members.map((member) => ({
        id: member.user.id,
        name: member.user.name || '',
        email: member.user.email,
        avatar: member.user.avatar || '',
        role: member.role.toLowerCase(),
        joinedAt: member.joinedAt,
        permissions: member.permissions,
      })),
    }

    return NextResponse.json(formattedGroup)
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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


export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const group = await prisma.group.findUnique({
        where: { id: params.id },
        select: { ownerId: true },
      });
  
      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }
  
      if (group.ownerId !== session.user.id) {
        return NextResponse.json(
          { error: "Only group owners can delete groups" },
          { status: 403 }
        );
      }
      await prisma.$transaction([
        prisma.taskAssignment.deleteMany({
          where: {
            task: {
              groupId: params.id,
            },
          },
        }),
     
        prisma.task.deleteMany({
          where: { groupId: params.id },
        }),
       
        prisma.channel.deleteMany({
          where: { groupId: params.id },
        }),
       
        prisma.groupMember.deleteMany({
          where: { groupId: params.id },
        }),
        
        prisma.group.delete({
          where: { id: params.id },
        }),
      ]);
  
      return NextResponse.json(
        { message: "Group deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting group:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

