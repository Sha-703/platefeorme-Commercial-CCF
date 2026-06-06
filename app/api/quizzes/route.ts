import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, courseId, questions } = body;

    if (!title || !courseId || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Titre, cours et questions requis" },
        { status: 400 }
      );
    }

    // Create quiz
    const quiz = await prisma.quizzes.create({
      data: {
        title,
        courseId,
        userId: session.user.id as string,
      },
    });

    // Create questions and options
    for (const q of questions) {
      const question = await prisma.questions.create({
        data: {
          text: q.text,
          type: q.type,
          order: q.order,
          quizId: quiz.id,
        },
      });

      // Create options for multiple choice
      if (q.type === "MULTIPLE_CHOICE" && q.options) {
        for (const opt of q.options) {
          await prisma.options.create({
            data: {
              text: opt.text,
              isCorrect: opt.isCorrect,
              order: opt.order,
              questionId: question.id,
            },
          });
        }
      }
    }

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const quizzes = await prisma.quizzes.findMany({
      where: courseId ? { courseId } : { userId: session.user.id as string },
      include: {
        questions: {
          include: { options: true },
        },
        course: { select: { title: true } },
      },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement" },
      { status: 500 }
    );
  }
}
