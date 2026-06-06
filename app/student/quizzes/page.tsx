"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Quiz {
  id: string;
  title: string;
  course: { title: string };
  questions: Array<{ id: string }>;
}

interface StudentQuizzes {
  completed: Array<{ quizId: string; quiz: Quiz }>;
  available: Quiz[];
}

export default function StudentQuizzesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<StudentQuizzes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user.role === "TEACHER") {
      router.push("/teacher/quizzes");
    } else if (status === "authenticated") {
      fetchQuizzes();
    }
  }, [status, session, router]);

  async function fetchQuizzes() {
    try {
      const res = await fetch("/api/student/quizzes");
      if (!res.ok) throw new Error("Erreur fetch");
      const fetchedData = await res.json();
      setData(fetchedData);
    } catch {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return <div className="container py-6 sm:py-8">Chargement...</div>;
  }

  if (!session) return null;

  return (
    <main className="container py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Tests Disponibles</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded mb-4 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {data?.available && data.available.length > 0 ? (
        <>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">À Faire</h2>
          <div className="grid gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
            {data.available.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-slate-50 border border-slate-900 rounded-lg shadow p-3 sm:p-4 lg:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 hover:shadow-lg transition"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-lg">{quiz.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Cours: {quiz.course.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {quiz.questions.length} question(s)
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/student/quiz/${quiz.id}`)}
                  className="btn-primary text-xs sm:text-sm w-full sm:w-auto flex-shrink-0"
                >
                  Commencer
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-blue-50 text-blue-600 p-3 sm:p-4 rounded mb-6 sm:mb-8 text-xs sm:text-sm">
          Aucun test disponible pour le moment
        </div>
      )}

      {data?.completed && data.completed.length > 0 && (
        <>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Complétés</h2>
          <div className="grid gap-2 sm:gap-3 lg:gap-4">
            {data.completed.map(({ quizId, quiz }) => (
              <div
                key={quizId}
                className="bg-slate-50 border border-slate-900 rounded-lg shadow p-3 sm:p-4 lg:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-lg">{quiz.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Cours: {quiz.course.title}</p>
                  <p className="text-xs text-green-600 mt-1">✅ Complété</p>
                </div>
                <button
                  onClick={() => router.push(`/student/quiz/${quizId}`)}
                  className="btn-secondary text-xs sm:text-sm w-full sm:w-auto flex-shrink-0"
                >
                  Refaire
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
