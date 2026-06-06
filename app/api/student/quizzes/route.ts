import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const studentId = session.user.id as string;

    // Get all quizzes
    const allQuizzes = await prisma.quizzes.findMany() || [];

    // Since mock db may not join the course and questions, let's fetch courses to join manually
    const courses = await prisma.courses.findMany() || [];

    // Map course title to quizzes
    const mappedQuizzes = allQuizzes.map((quiz: any) => {
      const course = courses.find((c: any) => c.id === quiz.courseId);
      return {
        ...quiz,
        course: { title: course ? course.title : "Cours inconnu" },
        questions: quiz.questions || [],
      };
    });

    // Get completed quiz results for the student
    const results = await prisma.quizResults.findMany({
      where: { studentId },
    }) || [];

    const completedIds = new Set(results.map((r: any) => r.quizId));

    // Available quizzes (not completed yet)
    const available = mappedQuizzes.filter((q: any) => !completedIds.has(q.id));

    // Completed quizzes mapped in the shape the frontend page expects: { quizId: string, quiz: Quiz }
    const completed = results.map((r: any) => {
      const quiz = mappedQuizzes.find((q: any) => q.id === r.quizId);
      return {
        quizId: r.quizId,
        quiz: quiz || { id: r.quizId, title: "Test inconnu", course: { title: "Cours inconnu" }, questions: [] },
      };
    });

    return NextResponse.json({
      available,
      completed,
    });
  } catch (error) {
    console.error("Error fetching student quizzes:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des tests" },
      { status: 500 }
    );
  }
}
