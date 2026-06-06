"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CourseDetail {
  id: string;
  title: string;
  quizzes: number;
  submissions: number;
}

interface DashboardData {
  courses: number;
  quizzes: number;
  submissions: number;
  avgScore: string;
  courseDetails: CourseDetail[];
}

export default function TeacherDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user.role !== "TEACHER") {
      router.push("/student/dashboard");
    } else if (status === "authenticated") {
      fetchDashboard();
    }
  }, [status, session, router]);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/teacher/dashboard");
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
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Tableau de Bord Enseignant</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatCard icon="📚" title="Cours" value={data.courses.toString()} />
        <StatCard icon="✅" title="Tests" value={data.quizzes.toString()} />
        <StatCard
          icon="📊"
          title="Soumissions"
          value={data.submissions.toString()}
        />
        <StatCard
          icon="⭐"
          title="Score Moyen"
          value={`${data.avgScore}%`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <ActionCard
          title="Créer un Cours"
          description="Créer un nouveau cours"
          icon="📖"
          onClick={() => router.push("/teacher/courses")}
        />
        <ActionCard
          title="Créer un Test"
          description="Créer et gérer les tests"
          icon="✏️"
          onClick={() => router.push("/teacher/quizzes")}
        />
        <ActionCard
          title="Gérer Ressources"
          description="Ajouter PDF et contenus"
          icon="📄"
          onClick={() => router.push("/teacher/resources")}
        />
        <ActionCard
          title="Voir Résultats"
          description="Résultats détaillés par cours"
          icon="📈"
          onClick={() => router.push("/teacher/results")}
        />
      </div>

      {data.courseDetails.length > 0 && (
        <>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Vue par Cours</h2>
          <div className="grid gap-2 sm:gap-3">
            {data.courseDetails.map((course) => (
              <div
                key={course.id}
                className="bg-slate-50 border border-slate-900 rounded-lg shadow p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/teacher/courses/${course.id}`)}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-sm sm:text-base">{course.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {course.quizzes} test(s) · {course.submissions} soumission(s)
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg sm:text-xl font-bold text-blue-600">
                    {course.submissions}
                  </div>
                  <div className="text-xs text-gray-500">soumises</div>
                </div>
              </div>
            ))}
          </div>
        </>
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
    <div className="bg-slate-50 border border-slate-900 rounded-lg shadow p-3 sm:p-4 lg:p-6 text-center">
      <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2">{icon}</div>
      <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{title}</p>
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-slate-50 border border-slate-900 rounded-lg shadow p-3 sm:p-4 lg:p-6 hover:shadow-lg transition cursor-pointer"
    >
      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{icon}</div>
      <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-600">{description}</p>
    </div>
  );
}
