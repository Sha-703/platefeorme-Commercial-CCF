"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?.role === "TEACHER") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!session) {
    return null;
  }

  const isTeacher = session.user?.role === "TEACHER";

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, {session.user?.name}!
          </h1>
          <p className="text-gray-600">
            {isTeacher ? "Tableau de bord enseignant" : "Tableau de bord élève"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isTeacher ? (
            <>
              <DashboardCard
                title="📚 Mes Cours"
                description="Créer et gérer vos cours"
                href="/teacher/courses"
              />
              <DashboardCard
                title="📄 Mes Ressources"
                description="Gérer vos ressources pédagogiques"
                href="/teacher/resources"
              />
              <DashboardCard
                title="✅ Tests"
                description="Créer et gérer les tests"
                href="/teacher/quizzes"
              />
              <DashboardCard
                title="📊 Résultats"
                description="Voir les résultats des élèves"
                href="/teacher/results"
              />
            </>
          ) : (
            <>
              <DashboardCard
                title="📚 Mes Cours"
                description="Accéder à vos cours"
                href="/student/courses"
              />
              <DashboardCard
                title="📊 Ma Progression"
                description="Voir votre progression"
                href="/student/progress"
              />
              <DashboardCard
                title="✅ Tests"
                description="Passer des tests"
                href="/student/quizzes"
              />
              <DashboardCard
                title="📈 Mes Résultats"
                description="Voir vos résultats"
                href="/student/results"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-slate-50 border border-slate-900 rounded-lg shadow p-6 hover:shadow-lg transition">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
        <div className="mt-4 text-blue-600 font-medium">Accéder →</div>
      </div>
    </Link>
  );
}
