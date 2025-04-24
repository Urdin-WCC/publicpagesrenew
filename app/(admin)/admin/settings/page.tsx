'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth-utils';
import { translations } from '@/app/translations';
import { Settings, CirclePlay, FileText, FolderKanban, Globe, Share2, Sidebar, PanelTop, Paintbrush } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

const settingsPages = [
  { 
    href: "/admin/settings/blog", 
    name: "Blog", 
    description: "Configura opciones del blog, como el número de posts por página o la visualización de autores.",
    icon: <FileText className="h-8 w-8" />
  },
  { 
    href: "/admin/settings/portfolio", 
    name: "Portfolio", 
    description: "Personaliza las opciones de visualización de proyectos y del portafolio.",
    icon: <FolderKanban className="h-8 w-8" />
  },
  { 
    href: "/admin/settings/header", 
    name: "Encabezado", 
    description: "Configura el logo, menú y otros elementos del encabezado del sitio.",
    icon: <PanelTop className="h-8 w-8" />
  },
  { 
    href: "/admin/settings/footer", 
    name: "Pie de página", 
    description: "Gestiona widgets y el contenido del pie de página del sitio.",
    icon: <PanelTop className="h-8 w-8 rotate-180" />
  },
  { 
    href: "/admin/settings/sidebar", 
    name: "Barra lateral", 
    description: "Configura los widgets y la posición de la barra lateral.",
    icon: <Sidebar className="h-8 w-8" />
  },
  { 
    href: "/admin/settings/menu", 
    name: "Menú de Navegación", 
    description: "Gestiona los elementos del menú de navegación principal del sitio.",
    icon: <CirclePlay className="h-8 w-8" />
  },
  { 
    href: "/admin/settings/social", 
    name: "Redes sociales", 
    description: "Administra los enlaces a tus redes sociales.",
    icon: <Globe className="h-8 w-8" />
  },
  { 
    href: "/admin/settings/sharing", 
    name: "Botones compartir", 
    description: "Configura los botones para compartir contenido en redes sociales.",
    icon: <Share2 className="h-8 w-8" />
  },
  { 
    href: "/admin/settings/appearance", 
    name: "Apariencia Global", 
    description: "Configura temas globales, spinner de carga, interruptor de tema y elementos fijos.",
    icon: <Paintbrush className="h-8 w-8" />
  }
];

const AdminSettingsPage = () => {
  const { data: session, status } = useSession();

  // Proteger la página - Requiere rol ADMIN o superior
  const canAccess = hasPermission(session?.user?.role, 'manage_settings');

  if (status === 'loading') {
    return <p className="p-8 text-center">{translations.common.loading}...</p>;
  }

  if (!canAccess) {
    // Idealmente, el middleware ya debería haber redirigido, pero es una doble seguridad
    return <p className="text-red-500 p-4">{translations.auth.unauthorized}</p>;
  }

  // Contenido mejorado de la página de configuración
  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <Settings className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-3">{translations.admin.settingsModule}</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Personaliza todos los aspectos de tu sitio web desde esta sección de configuración.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsPages.map((page) => (
          <Card key={page.href} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="bg-slate-50 pb-2">
              <div className="flex items-center gap-3">
                <div className="text-primary">{page.icon}</div>
                <CardTitle>{page.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardDescription className="min-h-[60px]">{page.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-end bg-slate-50">
              <Button asChild variant="outline">
                <Link href={page.href}>Configurar</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
