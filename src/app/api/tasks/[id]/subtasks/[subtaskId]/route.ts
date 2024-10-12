import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: { taskId: string; subtaskId: string } }
  ) {
    try {
      const { taskId, subtaskId } = params;
      const { completed } = await request.json();
  
      const updatedSubtask = await prisma.checklistItem.update({
        where: { id: subtaskId },
        data: { isCompleted: completed },
      });
  
      return NextResponse.json({ success: true, subtask: updatedSubtask });
    } catch (error) {
      console.error('Error updating subtask:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }