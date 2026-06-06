"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema } from "@/lib/validations";
import { ZodError } from "zod";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError("");

    try {
      // Validate form
      const validated = registerSchema.parse(formData);

      // Register user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error || "Erreur lors de l'enregistrement");
        return;
      }

      // Redirect to login
      router.push("/login?registered=true");
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setServerError("Erreur lors de l'enregistrement");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {serverError && (
        <div className="bg-red-50 text-red-600 p-2 sm:p-3 rounded text-xs sm:text-sm">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
          Nom complet
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full min-h-10 sm:min-h-12 text-sm sm:text-base"
          placeholder="Jean Dupont"
        />
        {errors.name && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full min-h-10 sm:min-h-12 text-sm sm:text-base"
          placeholder="exemple@email.com"
        />
        {errors.email && <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full min-h-10 sm:min-h-12 text-sm sm:text-base"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          className="w-full min-h-10 sm:min-h-12 text-sm sm:text-base"
          placeholder="••••••••"
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
          Rôle
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full min-h-10 sm:min-h-12 text-sm sm:text-base"
        >
          <option value="STUDENT">Élève</option>
          <option value="TEACHER">Enseignant</option>
        </select>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full min-h-10 sm:min-h-12 text-xs sm:text-sm">
        {loading ? "Inscription..." : "S'inscrire"}
      </button>
    </form>
  );
}
