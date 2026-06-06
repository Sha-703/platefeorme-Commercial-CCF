"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || "Email ou mot de passe incorrect");
      } else {
        // Redirect manually after successful login
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-2 sm:p-3 rounded text-xs sm:text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full min-h-10 sm:min-h-12 text-sm sm:text-base"
          placeholder="exemple@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full min-h-10 sm:min-h-12 text-sm sm:text-base"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full min-h-10 sm:min-h-12 text-xs sm:text-sm"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
