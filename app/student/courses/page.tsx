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
      <main className="container py-6 sm:py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-300 text-base sm:text-lg">Chargement des cours...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!session) return null;

  return (
    <main className="container py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
          📚 Mes Cours
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-slate-300">
          Explorez les cours disponibles et accédez aux contenus pédagogiques
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 backdrop-blur-sm text-xs sm:text-sm">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="text-4xl sm:text-6xl mb-4">📖</div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
            Aucun cours disponible
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Les cours seront disponibles prochainement.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 lg:gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group relative overflow-hidden rounded-lg sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-400/30"
            >
              {/* Gradient accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-4 sm:gap-6">
                  {/* Course Info */}
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-blue-300 transition-colors">
                      {course.title}
                    </h2>
                    {course.description && (
                      <p className="text-xs sm:text-sm lg:text-base text-slate-300 mb-3 sm:mb-5 leading-relaxed max-w-3xl">
                        {course.description}
                      </p>
                    )}

                    {/* Modules preview */}
                    {course.modules && course.modules.length > 0 && (
                      <div className="mb-4 sm:mb-5">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">
                          Modules du cours
                        </h3>
                        <div className="grid gap-2">
                          {course.modules
                            .sort((a, b) => a.order - b.order)
                            .map((mod, idx) => (
                              <div
                                key={mod.id}
                                className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-200"
                              >
                                <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="truncate sm:truncate-none">{mod.title}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
                      <span className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                        📖 {course.resources.length} unité(s)
                      </span>
                      <span className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                        ✅ {course.quizzes.length} quiz(s)
                      </span>
                      <span className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 whitespace-nowrap">
                        👨‍🏫 {course.user?.name || "Professeur"}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() =>
                      router.push(`/student/courses/${course.id}`)
                    }
                    className="group/btn relative overflow-hidden px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs sm:text-sm lg:text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  >
                    <span className="relative z-10 flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
                      Accéder au cours
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform hidden sm:inline"
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
          ))}
        </div>
      )}
    </main>
  );
}
