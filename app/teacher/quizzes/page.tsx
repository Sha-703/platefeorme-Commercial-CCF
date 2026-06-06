"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Quiz {
  id: string;
  title: string;
  courseId: string;
  course: { title: string };
  questions: Array<{ id: string }>;
  results: Array<{ id: string }>;
  createdAt: string;
}

export default function QuizzesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user.role !== "TEACHER") {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchQuizzes();
    }
  }, [status, session, router]);

  async function fetchQuizzes() {
    try {
      const res = await fetch("/api/quizzes");
      if (!res.ok) throw new Error("Erreur fetch");
      const data = await res.json();
      setQuizzes(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce test ?")) return;

    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur");
      setQuizzes(quizzes.filter((q) => q.id !== id));
    } catch {
      alert("Erreur suppression");
    }
  }

  if (status === "loading" || loading) {
    return <div className="container py-8">Chargement...</div>;
  }

  if (!session) return null;

  return (
    <main className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes Tests</h1>
        <button
          onClick={() => router.push("/teacher/quiz-builder")}
          className="btn-primary"
        >
          + Créer Test
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun test. Créez-en un !
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-slate-50 border border-slate-900 rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{quiz.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Cours: {quiz.course.title}
                  </p>
                  <div className="flex gap-6 text-sm text-gray-500">
                    <span>❓ {quiz.questions.length} question(s)</span>
                    <span>📊 {quiz.results.length} soumission(s)</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/teacher/quizzes/${quiz.id}`)}
                    className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-1 rounded text-sm"
                  >
                    Gérer
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
