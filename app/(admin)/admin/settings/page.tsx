'use client'; // O puede ser Server Component si no necesita interactividad inmediata

import React from 'react';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth-utils';
import { translations } from '@/app/translations';
import Link from 'next/link'; // Para enlaces a subsecciones

const AdminSettingsPage: React.FC = () => {
  const { data: session, status } = useSession();

  // Proteger la página - Requiere rol ADMIN o superior
  const canAccess = hasPermission(session?.user?.role, 'manage_settings');

  if (status === 'loading') {
    return <p>{translations.common.loading}...</p>;
  }

  if (!canAccess) {
    // Idealmente, el middleware ya debería haber redirigido, pero es una doble seguridad
    return <p className="text-red-500 p-4">{translations.auth.unauthorized}</p>;
  }

  // Contenido básico de la página de configuración principal
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">{translations.admin.settingsModule}</h1>
      <p className="mb-4">
        Selecciona una sección de configuración del menú lateral o de los siguientes enlaces:
      </p>
      {/* Podríamos añadir enlaces a las subsecciones existentes */}
      <ul className="list-disc pl-5 space-y-2">
        <li><Link href="/admin/settings/blog" className="text-primary hover:underline">Configuración del Blog</Link></li>
        <li><Link href="/admin/settings/header" className="text-primary hover:underline">Configuración de Cabecera</Link></li>
        <li><Link href="/admin/settings/footer" className="text-primary hover:underline">Configuración de Pie de Página</Link></li>
        <li><Link href="/admin/settings/sidebar" className="text-primary hover:underline">Configuración de Barra Lateral</Link></li>
        <li><Link href="/admin/settings/social" className="text-primary hover:underline">Configuración Social</Link></li>
        <li><Link href="/admin/settings/sharing" className="text-primary hover:underline">Configuración de Compartir</Link></li>
        {/* Añadir enlaces a otras secciones de configuración (SEO, Tema, etc.) cuando existan */}
      </ul>
    </div>
  );
};

export default AdminSettingsPage;