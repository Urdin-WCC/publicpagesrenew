import { ReactNode, Suspense } from "react";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import ThemeSwitcher from "@/components/public/ThemeSwitcher";
import LoadingSpinner from "@/components/core/LoadingSpinner";
// No importar AuthProvider aquí
import { translations } from "@/app/translations";
import MaintenanceMode from "@/components/public/MaintenanceMode";
import { getGlobalConfig, getActiveTheme, getSectionWithItems } from "@/lib/config";
import { SectionType, ThemePreset } from "@prisma/client";
// No importar auth aquí

const generateThemeCss = (theme: ThemePreset | null): string => {
  if (!theme?.cssVariables || typeof theme.cssVariables !== 'object') {
    return ':root { /* Default fallback theme */ --primary: #000000; }';
  }
  const variables = theme.cssVariables as Record<string, string>;
  let lightVars = '';
  let darkVars = '';
  for (const key in variables) {
    if (key.startsWith('--dark-')) {
      darkVars += `${key.replace('--dark-', '--')}: ${variables[key]};\n`;
    } else if (!key.startsWith('--dark-')) {
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
  // No obtener sesión aquí
  const [config, activeTheme, headerSection, footerSection] = await Promise.all([
    getGlobalConfig(),
    getActiveTheme(),
    getSectionWithItems(SectionType.HEADER),
    getSectionWithItems(SectionType.FOOTER)
  ]);

  const themeCss = generateThemeCss(activeTheme);
  const siteName = config?.siteName ?? translations.common.appName;
  const showLoadingSpinner = false; // O leer de config

  if (config?.maintenanceMode) {
    // El MaintenanceMode ahora se renderizará dentro del RootLayout
    return <MaintenanceMode />;
  }

  // Devolver solo el contenido, sin <html> o <body>
  // Aplicar clases estructurales a un div contenedor
  return (
    <>
      {/* Inyectar estilos del tema aquí temporalmente. Idealmente irían en RootLayout o de otra forma */}
      <head>
         <style dangerouslySetInnerHTML={{ __html: themeCss }} />
         {/* El <title> y <meta> description podrían ir en RootLayout o ser específicos de página */}
         <title>{siteName}</title>
         <meta name="description" content={`Sitio web ${siteName}`} />
      </head>
      <div className="flex flex-col min-h-screen">
        {showLoadingSpinner && <LoadingSpinner />}
        <Header
          menuItems={(headerSection?.menuItems ?? []).map(item => ({ label: item.label, url: item.url }))}
          siteName={siteName}
        />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </main>
        <Footer text={`© ${new Date().getFullYear()} ${siteName}. Todos los derechos reservados.`} widgets={footerSection?.widgets ?? []} />
        <ThemeSwitcher />
        {/* No envolver en AuthProvider aquí */}
      </div>
    </>
  );
}