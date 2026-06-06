"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export function NavBar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-slate-900 shadow-md border-b border-slate-700 sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-lg sm:text-xl font-bold text-white truncate flex-shrink-0">
          📚 Correspondance
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3 lg:gap-6">
          {session ? (
            <>
              <span className="text-xs sm:text-sm text-slate-300 truncate">
                {session.user?.name} ({session.user?.role})
              </span>
              <Link href="/dashboard" className="text-white hover:text-slate-200 transition text-sm">
                Dashboard
              </Link>
              {session.user?.role === "TEACHER" ? (
                <>
                  <Link href="/teacher/courses" className="text-white hover:text-slate-200 transition text-sm">
                    Cours
                  </Link>
                  <Link href="/teacher/quiz-builder" className="text-white hover:text-slate-200 transition text-sm">
                    Tests
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/student/courses" className="text-white hover:text-slate-200 transition text-sm">
                    Cours
                  </Link>
                  <Link href="/student/quizzes" className="text-white hover:text-slate-200 transition text-sm">
                    Tests
                  </Link>
                </>
              )}
              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white hover:text-slate-200 transition text-sm">
                Connexion
              </Link>
              <Link
                href="/register"
                className="bg-white hover:bg-slate-100 text-slate-900 font-medium px-3 py-1 rounded text-sm transition"
              >
                Inscription
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex flex-col gap-1 p-2 hover:bg-slate-800 rounded transition"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 animate-in slide-in-from-top-2">
          <div className="container py-4 space-y-3">
            {session ? (
              <>
                <p className="text-xs text-slate-300 px-2 py-2">
                  {session.user?.name} ({session.user?.role})
                </p>
                <Link 
                  href="/dashboard" 
                  className="block text-white hover:bg-slate-700 px-3 py-2 rounded transition"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                {session.user?.role === "TEACHER" ? (
                  <>
                    <Link 
                      href="/teacher/courses" 
                      className="block text-white hover:bg-slate-700 px-3 py-2 rounded transition"
                      onClick={closeMenu}
                    >
                      Cours
                    </Link>
                    <Link 
                      href="/teacher/quiz-builder" 
                      className="block text-white hover:bg-slate-700 px-3 py-2 rounded transition"
                      onClick={closeMenu}
                    >
                      Tests
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/student/courses" 
                      className="block text-white hover:bg-slate-700 px-3 py-2 rounded transition"
                      onClick={closeMenu}
                    >
                      Cours
                    </Link>
                    <Link 
                      href="/student/quizzes" 
                      className="block text-white hover:bg-slate-700 px-3 py-2 rounded transition"
                      onClick={closeMenu}
                    >
                      Tests
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    signOut();
                    closeMenu();
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition text-sm"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="block text-white hover:bg-slate-700 px-3 py-2 rounded transition"
                  onClick={closeMenu}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="block bg-white hover:bg-slate-100 text-slate-900 font-medium px-3 py-2 rounded transition text-center"
                  onClick={closeMenu}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
