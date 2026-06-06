"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface Resource {
  id: string;
  title: string;
  type: string;
  content: string;
  order: number;
  moduleId?: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: Array<{ id: string }>;
}

interface CourseModule {
  id: string;
  title: string;
  order: number;
  units: string[];
}

interface Course {
  id: string;
  title: string;
  description?: string;
  modules?: CourseModule[];
  resources: Array<Resource | { resource: Resource }>;
  quizzes: Quiz[];
  user: { name: string };
}

export default function StudentCourseDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeUnit, setActiveUnit] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchCourse();
    }
  }, [status, router, courseId]);

  async function fetchCourse() {
    try {
      const res = await fetch(`/api/student/courses/${courseId}`);
      if (!res.ok) throw new Error("Cours non trouvé");
      const data = await res.json();
      setCourse(data);

      // Auto-open first unit
      if (data.resources && data.resources.length > 0) {
        const firstRes = data.resources[0]?.resource || data.resources[0];
        if (firstRes) setActiveUnit(firstRes.id);
      }
    } catch {
      setError("Erreur lors du chargement du cours");
    } finally {
      setLoading(false);
    }
  }

  // Get all resources as a flat list
  function getAllResources(): Resource[] {
    if (!course) return [];
    return course.resources
      .map((r) => r.resource || r)
      .filter(Boolean)
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  }

  // Get resources for a specific module
  function getModuleResources(mod: CourseModule): Resource[] {
    const allRes = getAllResources();
    return allRes.filter(
      (r) =>
        mod.units.includes(r.id) ||
        r.moduleId === mod.id
    );
  }

  // Get the quiz for a specific module
  function getModuleQuiz(mod: CourseModule): Quiz | undefined {
    if (!course) return undefined;
    // Match by order (quiz-mod1 → Module 1, etc.)
    const modIndex = mod.order;
    return course.quizzes[modIndex - 1];
  }

  // Render markdown-like content to HTML
  function renderContent(content: string): string {
    let html = content;
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-blue-300 mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-4 pb-2 border-b border-white/10">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1</h1>');
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em class="text-slate-300 italic">$1</em>');
    // Blockquotes
    html = html.replace(
      /^> (.+)$/gm,
      '<blockquote class="border-l-4 border-blue-500/50 pl-4 py-2 my-3 bg-blue-500/5 rounded-r-lg text-slate-300 italic">$1</blockquote>'
    );
    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr class="my-6 border-white/10" />');
    // Unordered lists
    html = html.replace(
      /^- (.+)$/gm,
      '<li class="flex items-start gap-2 text-slate-300 mb-1"><span class="text-blue-400 mt-1">•</span><span>$1</span></li>'
    );
    // Ordered lists (simple)
    html = html.replace(
      /^(\d+)\. (.+)$/gm,
      '<li class="flex items-start gap-2 text-slate-300 mb-1"><span class="text-blue-400 font-bold mt-0.5">$1.</span><span>$2</span></li>'
    );
    // Code blocks
    html = html.replace(
      /```([^`]+)```/gs,
      '<pre class="bg-slate-800/80 border border-white/10 rounded-xl p-4 my-4 overflow-x-auto text-sm text-slate-300 font-mono">$1</pre>'
    );
    // Tables
    html = html.replace(
      /\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g,
      (match, header, body) => {
        const headerCells = header
          .split("|")
          .filter((c: string) => c.trim())
          .map(
            (c: string) =>
              `<th class="px-4 py-3 text-left text-sm font-semibold text-blue-300 bg-blue-500/10 border-b border-white/10">${c.trim()}</th>`
          )
          .join("");
        const rows = body
          .trim()
          .split("\n")
          .map((row: string) => {
            const cells = row
              .split("|")
              .filter((c: string) => c.trim())
              .map(
                (c: string) =>
                  `<td class="px-4 py-2.5 text-sm text-slate-300 border-b border-white/5">${c.trim()}</td>`
              )
              .join("");
            return `<tr class="hover:bg-white/5 transition-colors">${cells}</tr>`;
          })
          .join("");
        return `<div class="overflow-x-auto my-4 rounded-xl border border-white/10"><table class="w-full"><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table></div>`;
      }
    );
    // Paragraphs (lines not starting with HTML)
    html = html.replace(
      /^(?!<[a-z]|$)(.+)$/gm,
      '<p class="text-slate-300 leading-relaxed mb-2">$1</p>'
    );
    // Clean up empty paragraphs
    html = html.replace(/<p class="[^"]*"><\/p>/g, "");

    return html;
  }

  if (status === "loading" || loading) {
    return (
      <main className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-300 text-lg">Chargement du cours...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="container py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            {error || "Cours non trouvé"}
          </h2>
          <button
            onClick={() => router.push("/student/courses")}
            className="mt-4 px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            ← Retour aux cours
          </button>
        </div>
      </main>
    );
  }

  const allResources = getAllResources();
  const activeResource = allResources.find((r) => r.id === activeUnit);

  return (
    <main className="container py-8">
      {/* Back + Title */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/student/courses")}
          className="text-slate-400 hover:text-white transition mb-4 flex items-center gap-2 text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Retour aux cours
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {course.title}
        </h1>
        {course.description && (
          <p className="text-slate-300 text-lg max-w-3xl">
            {course.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        {/* Sidebar - Table of Contents */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-indigo-600/20">
              <h2 className="font-bold text-white text-lg">📑 Sommaire</h2>
            </div>

            <div className="p-3">
              {course.modules && course.modules.length > 0 ? (
                course.modules
                  .sort((a, b) => a.order - b.order)
                  .map((mod) => {
                    const modResources = getModuleResources(mod);
                    const modQuiz = getModuleQuiz(mod);

                    return (
                      <div key={mod.id} className="mb-4">
                        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider px-3 py-2">
                          {mod.title}
                        </h3>
                        <div className="space-y-1">
                          {modResources.map((res) => (
                            <button
                              key={res.id}
                              onClick={() => setActiveUnit(res.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                activeUnit === res.id
                                  ? "bg-blue-600/20 text-blue-300 border-l-2 border-blue-400"
                                  : "text-slate-400 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              📖 {res.title.replace(/^Unité \d+\.\d+ : /, "")}
                            </button>
                          ))}
                          {modQuiz && (
                            <button
                              onClick={() =>
                                router.push(`/student/quiz/${modQuiz.id}`)
                              }
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-all duration-200 flex items-center gap-2"
                            >
                              ✅ Passer le quiz
                              <span className="text-xs text-slate-500">
                                ({modQuiz.questions?.length || "?"} questions)
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="space-y-1">
                  {allResources.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => setActiveUnit(res.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        activeUnit === res.id
                          ? "bg-blue-600/20 text-blue-300 border-l-2 border-blue-400"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      📖 {res.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quiz Section at bottom */}
            {course.quizzes.length > 0 && !course.modules?.length && (
              <div className="p-3 border-t border-white/10">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider px-3 py-2">
                  🎯 Tests d&apos;évaluation
                </h3>
                {course.quizzes.map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => router.push(`/student/quiz/${quiz.id}`)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-amber-300 hover:bg-amber-500/10 transition-all duration-200"
                  >
                    ✅ {quiz.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="min-w-0">
          {activeResource ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
              {/* Unit Header */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
                <h2 className="text-xl font-bold text-white">
                  {activeResource.title}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {activeResource.type === "PDF"
                    ? "📄 Document PDF"
                    : "📝 Contenu textuel"}
                </p>
              </div>

              {/* Unit Content */}
              <div className="p-6 md:p-8">
                {activeResource.content ? (
                  <div
                    className="prose-custom"
                    dangerouslySetInnerHTML={{
                      __html: renderContent(activeResource.content),
                    }}
                  />
                ) : (
                  <p className="text-slate-400 italic">
                    Aucun contenu disponible pour cette unité.
                  </p>
                )}
              </div>

              {/* Navigation */}
              <div className="p-6 border-t border-white/10 flex items-center justify-between">
                {(() => {
                  const currentIndex = allResources.findIndex(
                    (r) => r.id === activeUnit
                  );
                  const prev =
                    currentIndex > 0
                      ? allResources[currentIndex - 1]
                      : null;
                  const next =
                    currentIndex < allResources.length - 1
                      ? allResources[currentIndex + 1]
                      : null;

                  return (
                    <>
                      {prev ? (
                        <button
                          onClick={() => {
                            setActiveUnit(prev.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition text-sm border border-white/10"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                          Précédent
                        </button>
                      ) : (
                        <div />
                      )}
                      {next ? (
                        <button
                          onClick={() => {
                            setActiveUnit(next.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition text-sm"
                        >
                          Suivant
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      ) : (
                        <div />
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <div className="text-5xl mb-4">👈</div>
              <p className="text-lg">
                Sélectionnez une unité dans le sommaire pour commencer
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
