// app/api/documents/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import prisma from '@/lib/db';


export async function GET(
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = params;
  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: { group: true },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const userInGroup = await prisma.groupMember.findFirst({
      where: {
        groupId: document.groupId,
        userId: session.user.id,
      },
    });

    if (!userInGroup) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const { title, content } = await request.json();

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: { group: true },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    
    const userInGroup = await prisma.groupMember.findFirst({
      where: {
        groupId: document.groupId,
        userId: session.user.id,
        role: { in: ['ADMIN', 'MODERATOR'] },
      },
    });

    if (!userInGroup) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        title,
        content,
        version: { increment: 1 },
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: { group: true },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const userInGroup = await prisma.groupMember.findFirst({
      where: {
        groupId: document.groupId,
        userId: session.user.id,
        role: 'ADMIN',
      },
    });

    if (!userInGroup) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.document.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}