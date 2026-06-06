"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface QuizResult {
  id: string;
  score: number;
  quiz: { title: string };
  submittedAt: string;
}

export default function ResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchResults();
    }
  }, [status, router]);

  async function fetchResults() {
    try {
      const res = await fetch("/api/results");
      if (!res.ok) throw new Error("Erreur fetch");
      const data = await res.json();
      setResults(data);
    } catch {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return <div className="container py-8">Chargement...</div>;
  }

  if (!session) return null;

  const avgScore =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)
      : 0;

  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Mes Résultats</h1>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

      {results.length === 0 ? (
        <div className="bg-slate-50 border border-slate-900 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">Aucun résultat pour le moment</p>
          <button
            onClick={() => router.push("/student/quizzes")}
            className="btn-primary"
          >
            Passer un test
          </button>
        </div>
      ) : (
        <>
          <div className="bg-slate-50 border border-slate-900 rounded-lg shadow p-6 mb-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Score moyen</p>
              <p className="text-4xl font-bold text-blue-600">{avgScore}%</p>
              <p className="text-gray-600 mt-2">{results.length} test(s) complété(s)</p>
            </div>
          </div>

          <div className="grid gap-4">
            {results.map((result) => {
              const scoreColor =
                result.score >= 50
                  ? "text-green-600"
                  : result.score >= 30
                  ? "text-yellow-600"
                  : "text-red-600";

              return (
                <div
                  key={result.id}
                  className="bg-slate-50 border border-slate-900 rounded-lg shadow p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold">{result.quiz.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(result.submittedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className={`text-3xl font-bold ${scoreColor}`}>
                    {Math.round(result.score)}%
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
