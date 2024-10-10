import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";

import { NextResponse } from "next/server";


export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const whereClause = {
      OR: [
        { creator: { email: session.user.email } },
        { assignments: { some: { assignee: { email: session.user.email } } } },
      ],
    };

    if (status) {
      // @ts-expect-error This is expected to fail because the function
      whereClause.status = status;
    }

    if (priority) {
      // @ts-expect-error This is expected to fail because the function
      whereClause.priority = priority;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        assignments: {
          select: {
            assignee: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
