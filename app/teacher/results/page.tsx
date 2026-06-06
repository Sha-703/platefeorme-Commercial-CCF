"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Result {
  id: string;
  score: number;
  createdAt: string;
  student: { name: string };
  quiz: { title: string; course: { title: string } };
}

export default function ResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user.role !== "TEACHER") {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchResults();
    }
  }, [status, session, router]);

  async function fetchResults() {
    try {
      const res = await fetch("/api/results");
      if (!res.ok) throw new Error("Erreur fetch");
      const data = await res.json();
      setResults(data);
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
      <h1 className="text-3xl font-bold mb-8">Résultats des Tests</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon="📊" title="Soumissions" value={results.length.toString()} />
        <StatCard icon="⭐" title="Score Moyen" value={`${avgScore}%`} />
        <StatCard
          icon="📈"
          title="Score Max"
          value={
            results.length > 0
              ? `${Math.max(...results.map((r) => r.score))}%`
              : "N/A"
          }
        />
      </div>

      {results.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun résultat pour le moment
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-slate-50 border border-slate-900 rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{result.quiz.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {result.quiz.course.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    Par {result.student.name} •{" "}
                    {new Date(result.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-3xl font-bold ${
                      result.score >= 70 ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    {result.score}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="bg-slate-50 border border-slate-900 rounded-lg shadow p-6 text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm mb-2">{title}</p>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );
}
