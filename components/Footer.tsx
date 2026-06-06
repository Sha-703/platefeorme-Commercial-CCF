"use client";

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">📚 Correspondance</h3>
            <p className="text-slate-300">
              Plateforme d'apprentissage pour la correspondance commerciale
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Ressources</h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="/teacher/courses" className="hover:text-white transition">
                  Cours
                </Link>
              </li>
              <li>
                <Link href="/student/quizzes" className="hover:text-white transition">
                  Quizzes
                </Link>
              </li>
              <li>
                <Link href="/teacher/resources" className="hover:text-white transition">
                  Ressources
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-slate-300">
              <li>Email: info@correspondance.fr</li>
              <li>Téléphone: +33 1 23 45 67 89</li>
              <li>Adresse: Paris, France</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-300 text-sm">
              © {currentYear} Plateforme de Correspondance Commerciale. Tous
              droits réservés.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="text-slate-300 hover:text-white text-sm transition">
                Politique de confidentialité
              </Link>
              <Link href="#" className="text-slate-300 hover:text-white text-sm transition">
                Conditions d'utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
