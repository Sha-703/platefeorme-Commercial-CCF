"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: "MULTIPLE_CHOICE" | "SHORT_ANSWER";
  order: number;
  options: Option[];
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  course: { title: string };
}

export default function QuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    isCompleted: boolean;
    answers: Array<{ questionId: string; isCorrect: boolean }>;
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchQuiz();
    }
  }, [status, router]);

  async function fetchQuiz() {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`);
      if (!res.ok) throw new Error("Test non trouvé");
      const data = await res.json();
      setQuiz(data);

      // Initialize answers object
      const initial: Record<string, string> = {};
      data.questions.forEach((q: Question) => {
        initial[q.id] = "";
      });
      setAnswers(initial);
    } catch {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Validate all answers
      if (Object.values(answers).some((a) => !a)) {
        setError("Répondez à toutes les questions");
        setSubmitting(false);
        return;
      }

      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const data = await res.json();
      setResult({
        score: data.score,
        isCompleted: data.isCompleted,
        answers: Array.isArray(data.answers) ? data.answers : [],
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur soumission");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || loading) {
    return <div className="container py-8">Chargement...</div>;
  }

  if (!quiz) {
    return <div className="container py-8">Test non trouvé</div>;
  }

  if (submitted && result) {
    return (
      <main className="container py-8 max-w-2xl">
        <div className="bg-slate-50 border border-slate-900 rounded-lg shadow p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Résultats</h1>

          <div
            className={`text-6xl font-bold mb-4 ${
              result.score >= 50 ? "text-green-600" : "text-red-600"
            }`}
          >
            {Math.round(result.score)}%
          </div>

          {result.isCompleted && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded mb-4 inline-block">
              ✅ Test Complété
            </div>
          )}

          {result.score < 50 && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 inline-block">
              ❌ Score insuffisant (besoin de plus de 50%)
            </div>
          )}

          <p className="text-xl text-gray-600 mb-8">
            {result.score >= 50 ? "✅ Bien joué !" : "❌ À réessayer"}
          </p>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Détails :</h2>
            <div className="space-y-2 text-left">
              {quiz.questions.map((question) => {
                const ans = result.answers.find(
                  (a) => a.questionId === question.id
                );
                return (
                  <div
                    key={question.id}
                    className={`p-3 rounded ${
                      ans?.isCorrect ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <p className="font-medium">{question.text}</p>
                    <p className="text-sm text-gray-600">
                      {ans?.isCorrect ? "✅ Correct" : "❌ Incorrect"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/student/quizzes")}
              className="btn-secondary"
            >
              Retour aux tests
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setResult(null);
                setAnswers({});
                quiz.questions.forEach((q: Question) => {
                  setAnswers((prev) => ({ ...prev, [q.id]: "" }));
                });
              }}
              className="btn-primary"
            >
              Refaire le test
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
      <p className="text-gray-600 mb-6">Cours: {quiz.course.title}</p>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-900 rounded-lg shadow p-6">
        <div className="space-y-8">
          {quiz.questions.map((question) => (
            <div key={question.id} className="border-b pb-6 last:border-b-0">
              <h3 className="font-semibold mb-4">
                Question {question.order}: {question.text}
              </h3>

              {question.type === "MULTIPLE_CHOICE" ? (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={question.id}
                        value={option.text}
                        checked={answers[question.id] === option.text}
                        onChange={(e) =>
                          setAnswers({
                            ...answers,
                            [question.id]: e.target.value,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span>{option.text}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[question.id]}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [question.id]: e.target.value,
                    })
                  }
                  required
                  className="w-full h-20"
                  placeholder="Entrez votre réponse..."
                />
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full mt-6"
        >
          {submitting ? "Soumission..." : "Soumettre le test"}
        </button>
      </form>
    </main>
  );
}
