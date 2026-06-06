import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { answers } = body; // { questionId: string, answer: string }[]

    const quiz = await prisma.quizzes.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Test non trouvé" }, { status: 404 });
    }

    // Get existing result if any
    const existing = await prisma.quizResult.findUnique({
      where: {
        studentId_quizId: {
          studentId: session.user.id as string,
          quizId: params.id,
        },
      },
    });

    // Calculate score
    let score = 0;
    const totalQuestions = quiz.questions.length;
    const questionAnswers = [];

    for (const qa of answers) {
      const question = quiz.questions.find((q) => q.id === qa.questionId);
      if (!question) continue;

      let isCorrect = false;

      if (question.type === "MULTIPLE_CHOICE") {
        const correctOption = question.options.find((o) => o.isCorrect);
        isCorrect = correctOption?.text === qa.answer;
      } else if (question.type === "SHORT_ANSWER") {
        // Simple validation: check if answer contains key words
        isCorrect =
          qa.answer.trim().toLowerCase().length > 2;
      }

      if (isCorrect) score++;

      questionAnswers.push({
        questionId: qa.questionId,
        answer: qa.answer,
        isCorrect,
      });
    }

    const newScore = (score / totalQuestions) * 100;
    const isCompleted = newScore > 50;

    let result;

    if (existing) {
      // Keep the best score
      const bestScore = Math.max(existing.score, newScore);
      const bestIsCompleted = bestScore > 50 || existing.score > 50;

      result = await prisma.quizResult.update({
        where: {
          studentId_quizId: {
            studentId: session.user.id as string,
            quizId: params.id,
          },
        },
        data: {
          score: bestScore,
          isCompleted: bestIsCompleted,
          answers: {
            deleteMany: {},
            create: questionAnswers,
          },
        },
        include: { answers: true },
      });
    } else {
      // Create new result
      result = await prisma.quizResult.create({
        data: {
          studentId: session.user.id as string,
          quizId: params.id,
          score: newScore,
          isCompleted,
          answers: {
            create: questionAnswers,
          },
        },
        include: { answers: true },
      });
    }

    return NextResponse.json(
      {
        ...result,
        isCompleted: result.isCompleted,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Erreur lors de la soumission" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quiz = await prisma.quizzes.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          include: {
            options: {
              select: {
                id: true,
                text: true,
                order: true,
              },
            },
          },
        },
        course: { select: { title: true } },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Test non trouvé" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement" },
      { status: 500 }
    );
  }
}
