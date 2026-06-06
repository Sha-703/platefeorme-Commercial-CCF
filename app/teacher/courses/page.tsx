"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  user: { name: string };
  resources: Array<{ resource: { id: string; title: string } }>;
  quizzes: Array<{ id: string; title: string }>;
}

export default function CoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isTeacher = session?.user.role === "TEACHER";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchCourses();
    }
  }, [status, router]);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Erreur fetch");
      const data = await res.json();
      setCourses(data);
    } catch {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce cours ?")) return;

    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur");
      setCourses(courses.filter((c) => c.id !== id));
      setSuccess("Cours supprimé");
    } catch {
      setError("Erreur suppression");
    }
  }

  if (status === "loading" || loading) {
    return <div className="container py-8">Chargement...</div>;
  }

  if (!session) return null;

  return (
    <main className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {isTeacher ? "Mes Cours" : "Cours Disponibles"}
        </h1>
        {isTeacher && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? "Annuler" : "+ Créer Cours"}
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4">{success}</div>}

      {showForm && isTeacher && (
        <CourseForm
          onSuccess={() => {
            setShowForm(false);
            fetchCourses();
            setSuccess("Cours créé");
          }}
        />
      )}

      <div className="grid gap-6">
        {courses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {isTeacher ? "Aucun cours. Créez-en un !" : "Aucun cours disponible"}
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-50 border border-slate-900 rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  {course.description && (
                    <p className="text-gray-600 mb-3">{course.description}</p>
                  )}
                  <div className="flex gap-6 text-sm text-gray-500">
                    <span>📖 {course.resources.length} ressource(s)</span>
                    <span>✅ {course.quizzes.length} test(s)</span>
                    <span>Par {course.user.name}</span>
                  </div>
                </div>
                {isTeacher && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(`/teacher/courses/${course.id}`)
                      }
                      className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-1 rounded text-sm"
                    >
                      Gérer
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

function CourseForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) throw new Error("Erreur création");
      onSuccess();
    } catch {
      setError("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-900 rounded-lg shadow p-6 mb-6">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full"
          placeholder="Ex: Correspondance commerciale B1"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-20"
          placeholder="Description du cours..."
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Création..." : "Créer Cours"}
      </button>
    </form>
  );
}
