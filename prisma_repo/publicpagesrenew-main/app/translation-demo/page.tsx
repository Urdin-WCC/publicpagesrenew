import Link from "next/link";
import { t, createTranslator } from "../translations";
import TranslationDemo from "@/components/TranslationDemo";

/**
 * Translation demo page
 *
 * This page demonstrates the translation system.
 *
 * @returns The translation demo page
 */
export default function TranslationDemoPage() {
  // Create a translator for the common group
  const tCommon = createTranslator("common");

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Sistema de Traducciones</h1>

      <p className="mb-6">
        Esta página demuestra el sistema de traducciones implementado en la aplicación.
        Todos los textos fijos de la interfaz están centralizados en un archivo de traducciones,
        lo que facilita la internacionalización futura de la aplicación.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Componente Cliente</h2>
          <TranslationDemo />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Función createTranslator</h2>
          <div className="p-4 border rounded-md">
            <h3 className="text-lg font-semibold mb-4">Ejemplos con Traductor Específico</h3>
            <p className="mb-2">
              La función createTranslator crea un traductor específico para un grupo:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>common.loading: {tCommon("loading")}</li>
              <li>common.error: {tCommon("error")}</li>
              <li>common.success: {tCommon("success")}</li>
              <li>common.cancel: {tCommon("cancel")}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Textos de la Interfaz</h2>
        <div className="p-4 border rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Botones</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t("common", "save")}</li>
                <li>{t("common", "cancel")}</li>
                <li>{t("common", "delete")}</li>
                <li>{t("common", "edit")}</li>
                <li>{t("common", "create")}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Autenticación</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t("auth", "login")}</li>
                <li>{t("auth", "logout")}</li>
                <li>{t("auth", "email")}</li>
                <li>{t("auth", "password")}</li>
                <li>{t("auth", "forgotPassword")}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Navegación</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t("public", "home")}</li>
                <li>{t("public", "blogPublic")}</li>
                <li>{t("public", "portfolioPublic")}</li>
                <li>{t("public", "contact")}</li>
                <li>{t("public", "about")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Ventajas del Sistema</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Centralización:</strong> Todos los textos están en un solo lugar, facilitando su mantenimiento.
          </li>
          <li>
            <strong>Organización:</strong> Los textos están organizados por grupos funcionales (common, auth, admin, etc.).
          </li>
          <li>
            <strong>Parámetros dinámicos:</strong> Soporte para insertar valores dinámicos en los textos.
          </li>
          <li>
            <strong>Preparado para internacionalización:</strong> Añadir un nuevo idioma es tan simple como crear un nuevo archivo con las traducciones.
          </li>
          <li>
            <strong>API sencilla:</strong> Fácil de usar tanto en componentes del servidor como del cliente.
          </li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
        >
          {t("common", "back")}
        </Link>
      </div>
    </div>
  );
}
