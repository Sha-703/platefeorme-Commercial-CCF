"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  modules?: Array<{
    id: string;
    title: string;
    order: number;
    units: string[];
  }>;
  resources: Array<{ resource: { id: string; title: string } }>;
  quizzes: Array<{ id: string; title: string }>;
  user: { name: string };
}

export default function StudentCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user.role === "TEACHER") {
      router.push("/teacher/courses");
    } else if (status === "authenticated") {
      fetchCourses();
    }
  }, [status, session, router]);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/student/courses");
      if (!res.ok) throw new Error("Erreur fetch");
      const data = await res.json();
      setCourses(data);
    } catch {
      setError("Erreur lors du chargement des cours");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-300 text-lg">Chargement des cours...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!session) return null;

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          📚 Mes Cours
        </h1>
        <p className="text-slate-300 text-lg">
          Explorez les cours disponibles et accédez aux contenus pédagogiques
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 backdrop-blur-sm">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Aucun cours disponible
          </h2>
          <p className="text-slate-400">
            Les cours seront disponibles prochainement.
          </p>
        </div>
      ) : (
        <div className="grid gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-400/30"
            >
              {/* Gradient accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  {/* Course Info */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                      {course.title}
                    </h2>
                    {course.description && (
                      <p className="text-slate-300 mb-5 leading-relaxed max-w-3xl">
                        {course.description}
                      </p>
                    )}

                    {/* Modules preview */}
                    {course.modules && course.modules.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                          Modules du cours
                        </h3>
                        <div className="grid gap-2">
                          {course.modules
                            .sort((a, b) => a.order - b.order)
                            .map((mod, idx) => (
                              <div
                                key={mod.id}
                                className="flex items-center gap-3 text-slate-200"
                              >
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="text-sm">{mod.title}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        📖 {course.resources.length} unité(s)
                      </span>
                      <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        ✅ {course.quizzes.length} quiz(s)
                      </span>
                      <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        👨‍🏫 {course.user?.name || "Professeur"}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="md:self-center shrink-0">
                    <button
                      onClick={() =>
                        router.push(`/student/courses/${course.id}`)
                      }
                      className="group/btn relative overflow-hidden px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Accéder au cours
                        <svg
                          className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </span>
                    </button>
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
