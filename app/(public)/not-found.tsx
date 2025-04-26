import Link from "next/link";
import { translations } from "@/app/translations";

/**
 * Página de "No encontrado" (404) personalizada para el layout público
 * 
 * Esta página se muestra cuando se intenta acceder a una ruta que no existe,
 * o cuando un recurso (post, proyecto, página) no se encuentra o no es visible.
 */
export default function NotFound() {
  return (
    <div className="w-full px-4 py-16 text-center" style={{ maxWidth: "100%" }}>
      <h1 className="text-4xl font-bold mb-6">
        {translations.errorPages.notFound}
      </h1>
      
      <p className="text-lg text-gray-600 mb-8">
        {translations.errorPages.notFoundDescription}
      </p>
      
      <Link 
        href="/"
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        {translations.errorPages.goHome}
      </Link>
    </div>
  );
}
