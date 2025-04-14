import { ReactNode, Suspense } from "react";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import ThemeSwitcher from "@/components/public/ThemeSwitcher";
import LoadingSpinner from "@/components/core/LoadingSpinner";
import AuthProvider from "@/components/AuthProvider";
import { t } from "@/app/translations";
import MaintenanceMode from "@/components/public/MaintenanceMode"; // Importar el nuevo componente
import { getGlobalConfig, getActiveTheme, getSectionWithItems, SiteSectionWithItems } from "@/lib/config";
import { SectionType, ThemePreset } from "@prisma/client";

// Helper function to generate CSS string from theme variables
const generateThemeCss = (theme: ThemePreset | null): string => {
  if (!theme?.cssVariables || typeof theme.cssVariables !== 'object') {
    return ':root { /* Default fallback theme */ --primary: #000000; }';
  }

  const variables = theme.cssVariables as Record<string, string>;
  let lightVars = '';
  let darkVars = '';

  for (const key in variables) {
    if (key.startsWith('--dark-')) {
      // Dark variables are applied inside .dark selector
      darkVars += `${key.replace('--dark-', '--')}: ${variables[key]};\n`;
    } else if (!key.startsWith('--dark-')) {
      // Light variables are applied to :root
      lightVars += `${key}: ${variables[key]};\n`;
    }
  }

  return `
    :root {\n${lightVars}}
    .dark {\n${darkVars}}
  `;
};

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Fetch real data from the database
  const [config, activeTheme, headerSection, footerSection] = await Promise.all([
    getGlobalConfig(),
    getActiveTheme(),
    getSectionWithItems(SectionType.HEADER),
    getSectionWithItems(SectionType.FOOTER)
  ]);

  const themeCss = generateThemeCss(activeTheme);
  const siteName = config?.siteName ?? t('common', 'appName');
  const showLoadingSpinner = false; // TODO: Obtener de config si se añade la opción

  // TODO: Implementar lógica para añadir/quitar clase 'dark' en <html> basada en ThemeSwitcher/cookie

  // Check maintenance mode from fetched config
  if (config?.maintenanceMode) {
    // Render the MaintenanceMode component directly
    return (
      <html lang="es">
        <body>
          <MaintenanceMode />
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <head>
        {/* Incluir CSS dinámico del tema */}
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        {/* Otros elementos del head */}
        <title>{siteName}</title>
        {/* TODO: Obtener descripción de GlobalConfig o SEO Module */}
        <meta name="description" content={`Sitio web ${siteName}`} />
      </head>
      <body className="flex flex-col min-h-screen">
        {/* AuthProvider es necesario si componentes hijos usan useSession */}
        <AuthProvider>
          {showLoadingSpinner && <LoadingSpinner />}
          {/* Pasar datos reales al Header */}
          <Header menuItems={headerSection?.menuItems ?? []} siteName={siteName} />
          <main className="flex-grow container mx-auto px-4 py-8">
            {/* Suspense es útil si las páginas hijas usan Server Components que cargan datos */}
            <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
          </main>
          {/* Pasar datos reales al Footer */}
          {/* TODO: Determinar el texto del footer (puede venir de GlobalConfig o un widget TEXT) */}
          <Footer text={`© ${new Date().getFullYear()} ${siteName}. Todos los derechos reservados.`} widgets={footerSection?.widgets ?? []} />
          <ThemeSwitcher />
          {/* TODO: Incluir CookieBanner (Módulo 7) */}
        </AuthProvider>
      </body>
    </html>
  );
}