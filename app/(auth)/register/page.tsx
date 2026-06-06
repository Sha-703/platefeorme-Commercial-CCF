import { RegisterForm } from "@/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-6 sm:py-12">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="bg-slate-50 border border-slate-900 shadow-md rounded-lg p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">Inscription</h1>

          <RegisterForm />

          <div className="text-center mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-gray-600">
              Déjà inscrit?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
