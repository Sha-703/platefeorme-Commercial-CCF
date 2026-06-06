import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Return all courses with their resources and quizzes (public for students)
    const courses = await prisma.courses.findMany({
      include: {
        resources: { include: { resource: true } },
        quizzes: true,
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching student courses:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des cours" },
      { status: 500 }
    );
  }
}
