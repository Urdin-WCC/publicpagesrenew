'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  const { data: portfolioConfig, error, isLoading, mutate } = useSWR<PortfolioConfigFormData>(
    '/api/settings/portfolio',
    fetcher,
    {
      revalidateOnFocus: false, // Evitar recargar al cambiar de pestaña
    }
  );
  
  // Cargar lista de temas disponibles
  const { data: themes } = useSWR<ThemePreset[]>('/api/theme/presets', fetcher, {
      revalidateOnFocus: false,
  });

  // Configurar formulario
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue, // Añadir setValue para poder actualizar campos
    formState: { errors, isDirty }, // isDirty para saber si hay cambios
  } = useForm<PortfolioConfigFormData>();

  // Resetear el formulario cuando la configuración se carga
  useEffect(() => {
    if (portfolioConfig) {
      reset(portfolioConfig);
      
      // Obtener asignaciones de tema para el portfolio
      try {
        fetch('/api/settings/global')
          .then(res => res.json())
          .then(globalConfig => {
            if (globalConfig?.themeAssignments) {
              try {
                const assignments = JSON.parse(globalConfig.themeAssignments);
                if (assignments.portfolio) {
                  if (assignments.portfolio.light) {
                    setValue('lightThemeId', assignments.portfolio.light);
                  }
                  if (assignments.portfolio.dark) {
                    setValue('darkThemeId', assignments.portfolio.dark);
                  }
                }
              } catch (e) {
                console.error('Error parsing theme assignments:', e);
              }
            }
          })
          .catch(err => console.error('Error fetching global config:', err));
      } catch (error) {
        console.error('Error setting up theme values:', error);
      }
    }
  }, [portfolioConfig, reset, setValue]);

  // Verificar permisos (ADMIN+)
  const canManageSettings = hasPermission(session?.user?.role, 'manage_settings');
  
  // Manejar cambios en selección de tema claro
  const handleLightThemeChange = (value: string) => {
    // Si es "default" o cadena vacía, establecer como null
    setValue('lightThemeId', value && value !== 'default' ? parseInt(value) : null);
  };

  // Manejar cambios en selección de tema oscuro
  const handleDarkThemeChange = (value: string) => {
    // Si es "default" o cadena vacía, establecer como null
    setValue('darkThemeId', value && value !== 'default' ? parseInt(value) : null);
  };

  // Manejar envío del formulario
  const onSubmit = async (data: PortfolioConfigFormData) => {
    setIsSaving(true);

    try {
      // Extraer IDs de temas para manejarlos separadamente
      const { lightThemeId, darkThemeId, ...portfolioData } = data;
      
      const response = await fetch('/api/settings/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portfolioData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || translations.notifications.saveError);
      }

      // Actualizar asignaciones de temas
      try {
        // Crear/actualizar asignaciones de temas
        let themeAssignments = {};
        
        // Si existe, intenta cargar themeAssignments actual
        const globalConfigRes = await fetch('/api/settings/global');
        if (globalConfigRes.ok) {
          const globalConfig = await globalConfigRes.json();
          if (globalConfig && globalConfig.themeAssignments) {
            try {
              themeAssignments = JSON.parse(globalConfig.themeAssignments);
            } catch (e) {
              console.error('Error parsing theme assignments', e);
            }
          }
        }
        
        // Actualizar asignación para portfolio
        themeAssignments = {
          ...themeAssignments,
          portfolio: {
            light: lightThemeId,
            dark: darkThemeId
          }
        };
        
        // Guardar asignaciones de temas en configuración global
        const themeResponse = await fetch('/api/settings/global', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            themeAssignments: JSON.stringify(themeAssignments)
          }),
        });
        
        if (!themeResponse.ok) {
          console.warn('Configuración guardada, pero hubo un error al guardar las asignaciones de tema');
        }
      } catch (themeError) {
        console.error('Error guardando asignaciones de tema:', themeError);
      }

      const updatedConfig = await response.json();
      mutate(updatedConfig, false); // Actualizar caché SWR sin revalidar
      reset({ ...updatedConfig, lightThemeId, darkThemeId }); // Resetear form para quitar 'isDirty' manteniendo temas
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
              {/* Selección de Temas */}
              <div className="border-t my-4"></div>
              <h3 className="text-lg font-medium mb-2">Temas Visuales</h3>
              
              {/* Tema Modo Claro */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lightThemeId">Tema para Modo Claro</Label>
                <Controller
                  name="lightThemeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={handleLightThemeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tema..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Tema por defecto del sitio</SelectItem>
                        {themes?.map((theme) => (
                          <SelectItem key={theme.id} value={theme.id.toString()}>
                            {theme.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-muted-foreground text-sm">
                  Selecciona el tema para el modo claro del portfolio (opcional).
                </p>
              </div>
              
              {/* Tema Modo Oscuro */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="darkThemeId">Tema para Modo Oscuro</Label>
                <Controller
                  name="darkThemeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={handleDarkThemeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tema..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Tema por defecto del sitio</SelectItem>
                        {themes?.map((theme) => (
                          <SelectItem key={theme.id} value={theme.id.toString()}>
                            {theme.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-muted-foreground text-sm">
                  Selecciona el tema para el modo oscuro del portfolio (opcional).
                </p>
              </div>
              
              {/* Separador */}
              <div className="border-t my-4"></div>
              <h3 className="text-lg font-medium mb-2">Configuración General</h3>
              
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
