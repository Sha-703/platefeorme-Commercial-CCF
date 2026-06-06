"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function NavBar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-slate-900 shadow-sm border-b border-slate-700">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-white">
          📚 Correspondance Commerciale
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <span className="text-sm text-slate-300">
                {session.user?.name} ({session.user?.role})
              </span>
              <Link href="/dashboard" className="text-white hover:text-slate-200">
                Dashboard
              </Link>
              {session.user?.role === "TEACHER" ? (
                <>
                  <Link href="/teacher/courses" className="text-white hover:text-slate-200">
                    Cours
                  </Link>
                  <Link href="/teacher/quiz-builder" className="text-white hover:text-slate-200">
                    Tests
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/student/courses" className="text-white hover:text-slate-200">
                    Cours
                  </Link>
                  <Link href="/student/quizzes" className="text-white hover:text-slate-200">
                    Tests
                  </Link>
                </>
              )}
              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white hover:text-slate-200">
                Connexion
              </Link>
              <Link
                href="/register"
                className="bg-white hover:bg-slate-100 text-slate-900 font-medium px-3 py-1 rounded"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
