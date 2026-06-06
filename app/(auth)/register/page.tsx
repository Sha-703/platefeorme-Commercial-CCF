import { RegisterForm } from "@/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="bg-slate-50 border border-slate-900 shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Inscription</h1>

          <RegisterForm />

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Déjà inscrit?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
