"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DashboardData {
  totalCourses: number;
  completedQuizzes: number;
  avgScore: number;
  recentResults: Array<{
    quiz: { title: string };
    score: number;
    submittedAt: string;
  }>;
}

export default function StudentDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user.role === "TEACHER") {
      router.push("/teacher/dashboard");
    } else if (status === "authenticated") {
      fetchDashboard();
    }
  }, [status, session, router]);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/student/dashboard");
      if (!res.ok) throw new Error("Erreur fetch");
      const fetchedData = await res.json();
      setData(fetchedData);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return <div className="container py-6 sm:py-8">Chargement...</div>;
  }

  if (!session || !data) return null;

  return (
    <main className="container py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Mon Apprentissage</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          icon="📚"
          title="Cours Suivis"
          value={data.totalCourses.toString()}
        />
        <StatCard
          icon="✅"
          title="Tests Complétés"
          value={data.completedQuizzes.toString()}
        />
        <StatCard
          icon="📊"
          title="Score Moyen"
          value={`${Math.round(data.avgScore)}%`}
        />
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Résultats Récents</h2>
      {data.recentResults.length > 0 ? (
        <div className="grid gap-2 sm:gap-3">
          {data.recentResults.slice(0, 5).map((result, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-900 rounded-lg shadow p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-base">{result.quiz.title}</h3>
                <p className="text-xs text-gray-500">
                  {new Date(result.submittedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div
                className={`text-xl sm:text-2xl font-bold ${
                  result.score >= 50 ? "text-green-600" : "text-red-600"
                }`}
              >
                {Math.round(result.score)}%
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-blue-50 text-blue-600 p-3 sm:p-4 rounded text-sm sm:text-base">
          Vous n'avez pas encore complété de tests. Commencez maintenant !
        </div>
      )}

      <div className="mt-6 sm:mt-8">
        <button
          onClick={() => router.push("/student/quizzes")}
          className="btn-primary text-xs sm:text-sm"
        >
          Voir tous les tests →
        </button>
      </div>
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
    <div className="bg-slate-50 border border-slate-900 rounded-lg shadow p-3 sm:p-4 lg:p-6 text-center">
      <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{icon}</div>
      <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{title}</p>
      <p className="text-2xl sm:text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );
}
