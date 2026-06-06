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

    // 1. Total courses in the database
    const courses = await prisma.courses.findMany();
    const totalCourses = courses.length;

    // 2. Quiz results for this student
    const results = await prisma.quizResults.findMany({
      where: { studentId },
    }) || [];

    // Since mock db does not join the quiz object automatically in findMany,
    // let's fetch all quizzes to join them manually!
    const quizzes = await prisma.quizzes.findMany() || [];

    // 3. Map results with their quiz title
    const recentResults = results.map((r: any) => {
      const quiz = quizzes.find((q: any) => q.id === r.quizId);
      return {
        quiz: { title: quiz ? quiz.title : "Test inconnu" },
        score: r.score,
        submittedAt: r.submittedAt || r.createdAt,
      };
    });

    // Sort recentResults by submittedAt desc
    recentResults.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    // 4. Calculate average score
    const completedQuizzes = results.length;
    const avgScore = completedQuizzes > 0
      ? results.reduce((sum: number, r: any) => sum + r.score, 0) / completedQuizzes
      : 0;

    return NextResponse.json({
      totalCourses,
      completedQuizzes,
      avgScore,
      recentResults,
    });
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des statistiques" },
      { status: 500 }
    );
  }
}
