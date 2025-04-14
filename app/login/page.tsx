"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Login page component
 *
 * This page allows users to log in to the application.
 * All user-facing text is in Spanish as required.
 *
 * @returns The login page component
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
<<<<<<< HEAD
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
=======
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";
>>>>>>> feature/modulo4

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle form submission
   * @param e - The form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Credenciales inválidas. Por favor, inténtalo de nuevo.");
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      setError("Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Neurowitch</h1>
        <h2 className="text-xl text-center mb-6 text-gray-600">Iniciar Sesión</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            ¿Olvidaste tu contraseña? Contacta con el administrador del sistema.
          </p>
          <p className="mt-2">
            <Link href="/" className="text-primary hover:underline">
              Volver a la página principal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
