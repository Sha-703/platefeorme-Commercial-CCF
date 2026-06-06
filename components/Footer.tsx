"use client";

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-6 sm:py-8 lg:py-12 mt-8 sm:mt-12 border-t border-slate-700">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">📚 Correspondance</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Plateforme d'apprentissage pour la correspondance commerciale
            </p>
          </div>

          {/* Navigation */}
          <div className="text-center sm:text-left">
            <h4 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">Navigation</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <Link href="/" className="hover:text-white transition inline-block">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition inline-block">
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition inline-block">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div className="text-center sm:text-left">
            <h4 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">Ressources</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <Link href="/teacher/courses" className="hover:text-white transition inline-block">
                  Cours
                </Link>
              </li>
              <li>
                <Link href="/student/quizzes" className="hover:text-white transition inline-block">
                  Quizzes
                </Link>
              </li>
              <li>
                <Link href="/teacher/resources" className="hover:text-white transition inline-block">
                  Ressources
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center sm:text-left">
            <h4 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">Contact</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-300">
              <li>Email: info@correspondance.fr</li>
              <li>Téléphone: +33 1 23 45 67 89</li>
              <li>Adresse: Paris, France</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-4 sm:pt-6 lg:pt-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center text-center sm:text-left">
            <p className="text-slate-300 text-xs sm:text-sm">
              © {currentYear} Plateforme de Correspondance Commerciale. Tous droits réservés.
            </p>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm flex-wrap justify-center sm:justify-end">
              <Link href="#" className="text-slate-300 hover:text-white transition">
                Politique de confidentialité
              </Link>
              <Link href="#" className="text-slate-300 hover:text-white transition">
                Conditions d'utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
