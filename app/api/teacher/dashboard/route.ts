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

    // Get teacher's courses
    const courses = await prisma.courses.findMany({
      where: { userId: session.user.id as string },
      include: {
        quizzes: {
          include: {
            results: true,
          },
        },
      },
    });

    // Calculate stats
    const totalQuizzes = courses.reduce((sum, c) => sum + c.quizzes.length, 0);
    const totalResults = courses.reduce(
      (sum, c) => sum + c.quizzes.reduce((qs, q) => qs + q.results.length, 0),
      0
    );

    const avgScore =
      totalResults > 0
        ? courses.reduce(
            (sum, c) =>
              sum +
              c.quizzes.reduce(
                (qs, q) =>
                  qs + q.results.reduce((rs, r) => rs + r.score, 0),
                0
              ),
            0
          ) / totalResults
        : 0;

    return NextResponse.json({
      courses: courses.length,
      quizzes: totalQuizzes,
      submissions: totalResults,
      avgScore: avgScore.toFixed(1),
      courseDetails: courses.map((c) => ({
        id: c.id,
        title: c.title,
        quizzes: c.quizzes.length,
        submissions: c.quizzes.reduce((sum, q) => sum + q.results.length, 0),
      })),
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement" },
      { status: 500 }
    );
  }
}
