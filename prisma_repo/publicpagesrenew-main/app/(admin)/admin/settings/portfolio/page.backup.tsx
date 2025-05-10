'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth-utils';
import { translations } from '@/app/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Role } from '@prisma/client';
import useSWR from 'swr';

// Importar la interfaz PortfolioConfig desde config-server.ts
import { PortfolioConfig } from '@/lib/config-server';

// Extensión de la interfaz para incluir temas
interface PortfolioConfigFormData extends PortfolioConfig {
  lightThemeId?: number | null;
  darkThemeId?: number | null;
}

// Interfaz para el tema
interface ThemePreset {
  id: number;
  name: string;
}

// Fetcher para SWR
const fetcher = (url: string) => fetch(url).then(async res => {
'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth-utils';
import { translations } from '@/app/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Role } from '@prisma/client';
import useSWR from 'swr';

'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth-utils';
import { translations } from '@/app/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Role } from '@prisma/client';
import useSWR from 'swr';

// Importar la interfaz PortfolioConfig desde config-server.ts
import { PortfolioConfig } from '@/lib/config-server';

// Fetcher para SWR
const fetcher = (url: string) => fetch(url).then(async res => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar la configuración');
    }
    return res.json();
});



export default function PortfolioSettingsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const role = session?.user?.role as Role | undefined;

  // Cargar configuración actual usando SWR
  const { data: portfolioConfig, error, isLoading, mutate } = useSWR<PortfolioConfig>(
    '/api/settings/portfolio',
    fetcher,
    {
      revalidateOnFocus: false, // Evitar recargar al cambiar de pestaña
    }
  );

  // Configurar formulario
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue, // Añadir setValue para poder actualizar campos
    formState: { errors, isDirty }, // isDirty para saber si hay cambios
  } = useForm<PortfolioConfig>();

  // Resetear el formulario cuando la configuración se carga
  useEffect(() => {
    if (portfolioConfig) {
      reset(portfolioConfig);
    }
  }, [portfolioConfig, reset]);

  // Verificar permisos (ADMIN+)
  const canManageSettings = hasPermission(session?.user?.role, 'manage_settings');

  // Manejar envío del formulario
  const onSubmit = async (data: PortfolioConfig) => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/settings/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || translations.notifications.saveError);
      }

      const updatedConfig = await response.json();
      mutate(updatedConfig, false); // Actualizar caché SWR sin revalidar
      reset(updatedConfig); // Resetear form para quitar 'isDirty'
      toast.success(translations.notifications.saveSuccess);
    } catch (error: any) {
      console.error('Error saving portfolio config:', error);
      toast.error(error.message || translations.notifications.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  if (sessionStatus === 'loading' || isLoading) {
    return <p>{translations.common.loading}...</p>;
  }

  if (!canManageSettings) {
    return <p className="text-red-500 p-4">{translations.auth.unauthorized}</p>;
  }

  if (error) {
    return <p className="text-red-500 p-4">Error al cargar la configuración: {error.message}</p>
  }



  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{translations.admin.portfolioSettings.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Proyectos por página */}
              <div>
                <Label htmlFor="projectsPerPage">
                  {translations.admin.portfolioSettings.projectsPerPageLabel}
                </Label>
                <Input
                  id="projectsPerPage"
                  type="number"
                  min="1"
                  max="100"
                  {...register('projectsPerPage', {
                    required: true,
                    valueAsNumber: true,
                    min: 1,
                    max: 100,
                  })}
                  className="w-24"
                />
                {errors.projectsPerPage && (
                  <p className="text-red-500 text-xs mt-1">
                    Debe ser un número entre 1 y 100
                  </p>
                )}
              </div>

              {/* Tipo de visualización predeterminado */}
              <div>
                <Label htmlFor="defaultDisplayType">
                  {translations.admin.portfolioSettings.defaultDisplayTypeLabel}
                </Label>
                <Select
                  value={watch('defaultDisplayType')}
                  onValueChange={(value) => setValue('defaultDisplayType', value)}
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">{translations.admin.portfolioForm.displayTypeSingle}</SelectItem>
                    <SelectItem value="GALLERY">{translations.admin.portfolioForm.displayTypeGallery}</SelectItem>
                    <SelectItem value="SLIDER">{translations.admin.portfolioForm.displayTypeSlider}</SelectItem>
                    <SelectItem value="GRID">{translations.admin.portfolioForm.displayTypeGrid}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Modo de visualización del listado */}
              <div>
                <Label htmlFor="layoutMode">
                  {translations.admin.portfolioSettings.layoutModeLabel}
                </Label>
                <Select
                  value={watch('layoutMode')}
                  onValueChange={(value: 'grid' | 'list') => setValue('layoutMode', value)}
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">{translations.admin.portfolioSettings.layoutModeGrid}</SelectItem>
                    <SelectItem value="list">{translations.admin.portfolioSettings.layoutModeList}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mostrar barra lateral en el listado */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="showSidebarInList"
                  checked={watch('showSidebarInList')}
                  onCheckedChange={(checked) => setValue('showSidebarInList', checked)}
                />
                <Label htmlFor="showSidebarInList" className="font-normal cursor-pointer">
                  {translations.admin.portfolioSettings.showSidebarInListLabel}
                </Label>
              </div>

              {/* Mostrar barra lateral en el proyecto individual */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="showSidebarInProject"
                  checked={watch('showSidebarInProject')}
                  onCheckedChange={(checked) => setValue('showSidebarInProject', checked)}
                />
                <Label htmlFor="showSidebarInProject" className="font-normal cursor-pointer">
                  {translations.admin.portfolioSettings.showSidebarInProjectLabel}
                </Label>
              </div>

              {/* Botón de guardar */}
              <Button type="submit" disabled={isSaving} className="mt-6">
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    {translations.common.loading}
                  </>
                ) : (
                  translations.admin.portfolioSettings.saveButton
                )}
              </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
