"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="bg-slate-50 border border-slate-900 shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>

          <LoginForm />

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Pas encore de compte?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
