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

    const results = await prisma.quizResults.findMany({
      where: { studentId: session.user.id as string },
      include: {
        quiz: { select: { title: true } },
        answers: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement" },
      { status: 500 }
    );
  }
}
