"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Resource {
  id: string;
  title: string;
  type: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
}

export default function ResourcesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user.role !== "TEACHER") {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchResources();
    }
  }, [status, session, router]);

  async function fetchResources() {
    try {
      const res = await fetch("/api/resources");
      const data = await res.json();
      setResources(data);
    } catch {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette ressource ?")) return;

    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erreur suppression");

      setResources(resources.filter((r) => r.id !== id));
      setSuccess("Ressource supprimée");
    } catch {
      setError("Erreur lors de la suppression");
    }
  }

  if (status === "loading" || loading) {
    return <div className="container py-8">Chargement...</div>;
  }

  if (!session) return null;

  return (
    <main className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes Ressources</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? "Annuler" : "+ Ajouter Ressource"}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4">{success}</div>}

      {showForm && <ResourceForm onSuccess={() => {
        setShowForm(false);
        fetchResources();
        setSuccess("Ressource créée");
      }} />}

      <div className="grid gap-4">
        {resources.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune ressource. Créez-en une pour commencer.
          </div>
        ) : (
          resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-slate-50 border border-slate-900 rounded-lg shadow p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{resource.title}</h3>
                <p className="text-sm text-gray-600">
                  {resource.type === "PDF" ? "📄 PDF" : "📝 Texte"}
                  {resource.fileSize && ` • ${(resource.fileSize / 1024).toFixed(1)}KB`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(resource.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <button
                onClick={() => handleDelete(resource.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

function ResourceForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("TEXT");
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (type === "PDF") {
        if (!file) {
          setError("Sélectionnez un fichier PDF");
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("type", "PDF");

        const res = await fetch("/api/resources/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
      } else {
        const res = await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            type: "TEXT",
            content,
          }),
        });

        if (!res.ok) throw new Error("Erreur création");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-900 rounded-lg shadow p-6 mb-6">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full"
            placeholder="Ex: Lettre commerciale"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full"
          >
            <option value="TEXT">Texte</option>
            <option value="PDF">PDF</option>
          </select>
        </div>
      </div>

      {type === "TEXT" ? (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Contenu</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full h-32"
            placeholder="Entrez le contenu du cours..."
          />
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Fichier PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="w-full"
          />
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Création..." : "Créer Ressource"}
      </button>
    </form>
  );
}
