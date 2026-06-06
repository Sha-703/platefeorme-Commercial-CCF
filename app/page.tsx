import { auth } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <>
      <NavBar />
      <main className="min-h-screen">
        <div className="container py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              📚 Plateforme de Correspondance Commerciale
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Apprenez la correspondance commerciale avec nos cours interactifs,
              ressources complètes et tests avec correction automatique.
            </p>

            {session ? (
              <Link
                href="/dashboard"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Accéder au Dashboard
              </Link>
            ) : (
              <div className="flex gap-4 justify-center">
                <Link
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Se Connecter
                </Link>
                <Link
                  href="/register"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg"
                >
                  S'Inscrire
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <FeatureCard
              icon="📖"
              title="Cours Complets"
              description="Accédez à des cours structurés sur la correspondance commerciale"
            />
            <FeatureCard
              icon="✅"
              title="Tests Interactifs"
              description="Testez vos connaissances avec des tests à correction automatique"
            />
            <FeatureCard
              icon="📊"
              title="Suivi Progressif"
              description="Suivez votre progression et vos résultats en temps réel"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-slate-50 border border-slate-900 rounded-lg shadow p-6 border-t-4 border-t-blue-900 hover:shadow-lg transition">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-blue-600">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
