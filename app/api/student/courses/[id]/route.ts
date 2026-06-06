import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.courses.findUnique({
      where: { id: params.id },
      include: {
        resources: { include: { resource: true } },
        quizzes: { include: { questions: true } },
        user: { select: { name: true } },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Cours non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course details:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du cours" },
      { status: 500 }
    );
  }
}
