import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, subtaskId: string } }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const updatedSubtask = await prisma.task.update({
      where: { id: params.subtaskId },
      data,
    });
    return NextResponse.json(updatedSubtask);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update subtask' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string, subtaskId: string } }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.task.delete({
      where: { id: params.subtaskId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete subtask' }, { status: 500 });
  }
}