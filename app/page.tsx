import Image from "next/image";
import Link from "next/link";
import { translations } from "./translations"; // Usar importación directa

/**
 * Home page component
 *
 * This is the main landing page of the application.
 * It demonstrates the use of the translation system.
 *
 * @returns The home page component
 */
export default function Home() {
  // Acceder a traducciones directamente desde el objeto
  const welcomeText = translations.admin.welcome.replace("{0}", "Usuario");
  const blogText = translations.admin.blog;
  const portfolioText = translations.admin.portfolio;
  const pagesText = translations.admin.pages;
  const loginText = translations.auth.login;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Neurowitch</h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="text-gray-800 hover:text-primary">
                  {translations.public.home}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-800 hover:text-primary">
                  {translations.public.blogPublic}
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-800 hover:text-primary">
                  {translations.public.portfolioPublic}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-800 hover:text-primary">
                  {loginText}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-white to-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Neurowitch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              {welcomeText}
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/translation-demo"
                className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                Ver Demo de Traducciones
              </Link>
              <Link
                href="/login"
                className="bg-white text-primary border border-primary px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                {loginText}
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center">Módulos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">{blogText}</h3>
                <p className="text-gray-600">
                  {translations.admin.blogDescription}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4">🖼️</div>
                <h3 className="text-xl font-semibold mb-2">{portfolioText}</h3>
                <p className="text-gray-600">
                  {translations.admin.portfolioDescription}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">{pagesText}</h3>
                <p className="text-gray-600">
                  {translations.admin.pagesDescription}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center">Sistema de Traducciones</h2>
            <div className="max-w-3xl mx-auto">
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-4">Ejemplos de Traducciones</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>common.save: {translations.common.save}</li>
                  <li>admin.welcome con parámetro: {translations.admin.welcome.replace("{0}", "Usuario")}</li>
                  <li>auth.login: {translations.auth.login}</li>
                  <li>auth.logout: {translations.auth.logout}</li>
                </ul>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link
                href="/translation-demo"
                className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                Ver Demo Completo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">Neurowitch</h2>
              <p className="text-gray-400 mt-2">Una aplicación web completa y modular</p>
            </div>
            <div>
              <p className="text-gray-400">© {new Date().getFullYear()} Neurowitch. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
