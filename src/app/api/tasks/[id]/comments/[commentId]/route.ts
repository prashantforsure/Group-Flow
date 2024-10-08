import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { CommentCreateSchema } from "@/lib/validations/comments";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string; commentId: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const body = await req.json();
      const { content } = CommentCreateSchema.parse(body);
  
      const comment = await prisma.comment.findUnique({
        where: { id: params.commentId },
        include: { task: { include: { group: true } } }
      });
  
      if (!comment) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }
  
      if (comment.authorId !== session.user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
  
      const updatedComment = await prisma.comment.update({
        where: { id: params.commentId },
        data: {
          content,
          isEdited: true
        },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });
  
      return NextResponse.json(updatedComment);
    } catch (error) {
      
      console.error('Error updating comment:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
  
  export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; commentId: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const comment = await prisma.comment.findUnique({
        where: { id: params.commentId },
        include: { task: { include: { group: true } } }
      });
  
      if (!comment) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }
      const groupMember = await prisma.groupMember.findFirst({
        where: {
          groupId: comment.task.groupId,
          userId: session.user.id,
        }
      });
  
      if (!groupMember || (comment.authorId !== session.user.id && groupMember.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
  
      await prisma.comment.delete({
        where: { id: params.commentId }
      });
  
      return NextResponse.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }