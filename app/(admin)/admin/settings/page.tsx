'use client'; // O puede ser Server Component si no necesita interactividad inmediata

import React from 'react';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth-utils';
import { translations } from '@/app/translations';
import { Settings } from 'lucide-react'; // Importar icono de Settings
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

  // Contenido simplificado de la página de configuración
  return (
    <div className="container mx-auto p-8 md:p-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          <Settings className="h-16 w-16 text-primary mb-4" />
          
          <h1 className="text-2xl font-bold mb-3">{translations.admin.settingsModule}</h1>
          
          <p className="mb-6 text-lg text-gray-600">
            Utiliza el menú de navegación lateral para acceder a las diferentes opciones de configuración del sistema.
          </p>
          
          <p className="text-sm text-gray-500 max-w-md">
            Cada elemento de configuración te permite personalizar diferentes aspectos de la aplicación, como el blog, 
            la apariencia, las redes sociales y más.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
