"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Question {
  order: number;
  text: string;
  type: "MULTIPLE_CHOICE" | "SHORT_ANSWER";
  options?: Array<{
    order: number;
    text: string;
    isCorrect: boolean;
  }>;
}

export default function QuizBuilderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      order: 1,
      text: "",
      type: "MULTIPLE_CHOICE",
      options: [
        { order: 1, text: "", isCorrect: false },
        { order: 2, text: "", isCorrect: false },
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user.role !== "TEACHER") {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchCourses();
    }
  }, [status, session, router]);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      setCourses(data);
    } catch {
      setError("Erreur chargement cours");
    }
  }

  function addQuestion() {
    const newQuestion: Question = {
      order: questions.length + 1,
      text: "",
      type: "MULTIPLE_CHOICE",
      options: [
        { order: 1, text: "", isCorrect: false },
        { order: 2, text: "", isCorrect: false },
      ],
    };
    setQuestions([...questions, newQuestion]);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, updates: Partial<Question>) {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  }

  function addOption(qIndex: number) {
    const updated = [...questions];
    const opts = updated[qIndex].options || [];
    opts.push({
      order: opts.length + 1,
      text: "",
      isCorrect: false,
    });
    updated[qIndex].options = opts;
    setQuestions(updated);
  }

  function updateOption(
    qIndex: number,
    oIndex: number,
    updates: Partial<(Question["options"])[0]>
  ) {
    const updated = [...questions];
    const opts = updated[qIndex].options || [];
    opts[oIndex] = { ...opts[oIndex], ...updates };
    updated[qIndex].options = opts;
    setQuestions(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!title || !courseId || questions.some((q) => !q.text)) {
      setError("Remplir tous les champs requis");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          courseId,
          questions: questions.map((q) => ({
            ...q,
            options:
              q.type === "MULTIPLE_CHOICE"
                ? (q.options || []).filter((o) => o.text)
                : undefined,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      router.push("/teacher/quizzes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur création");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return <div className="container py-8">Chargement...</div>;
  }

  if (!session) return null;

  return (
    <main className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Créer un Test</h1>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-900 rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Titre du test</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full"
              placeholder="Ex: Quiz Module 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cours</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className="w-full"
            >
              <option value="">Sélectionner un cours</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <div
              key={qIndex}
              className="border rounded-lg p-4 bg-gray-50"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold">Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Énoncé</label>
                <textarea
                  value={question.text}
                  onChange={(e) =>
                    updateQuestion(qIndex, { text: e.target.value })
                  }
                  required
                  className="w-full h-16"
                  placeholder="Entrez la question..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={question.type}
                  onChange={(e) =>
                    updateQuestion(qIndex, {
                      type: e.target.value as "MULTIPLE_CHOICE" | "SHORT_ANSWER",
                    })
                  }
                  className="w-full"
                >
                  <option value="MULTIPLE_CHOICE">QCM</option>
                  <option value="SHORT_ANSWER">Réponse courte</option>
                </select>
              </div>

              {question.type === "MULTIPLE_CHOICE" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Options</label>
                    <button
                      type="button"
                      onClick={() => addOption(qIndex)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Ajouter option
                    </button>
                  </div>
                  {(question.options || []).map((option, oIndex) => (
                    <div key={oIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) =>
                          updateOption(qIndex, oIndex, { text: e.target.value })
                        }
                        className="flex-1"
                        placeholder={`Option ${oIndex + 1}`}
                      />
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) =>
                            updateOption(qIndex, oIndex, {
                              isCorrect: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm">Correcte</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addQuestion}
          className="btn-secondary w-full my-6"
        >
          + Ajouter Question
        </button>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Création..." : "Créer Test"}
        </button>
      </form>
    </main>
  );
}
