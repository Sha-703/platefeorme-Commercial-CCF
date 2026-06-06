import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Get all quizzes from courses
    const allQuizzes = await prisma.quizzes.findMany({
      include: {
        course: { select: { title: true } },
        questions: true,
      },
    });

    // Get completed quizzes by student
    const completed = await prisma.quizResults.findMany({
      where: { studentId: session.user.id as string },
      select: { quizId: true },
    });

    const completedIds = new Set(completed.map((c) => c.quizId));
    const available = allQuizzes.filter((q) => !completedIds.has(q.id));
    const completedQuizzes = allQuizzes.filter((q) => completedIds.has(q.id));

    return NextResponse.json({
      available,
      completed: completed.map((c) => ({
        ...completedQuizzes.find((q) => q.id === c.quizId),
      })),
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement" },
      { status: 500 }
    );
  }
}
