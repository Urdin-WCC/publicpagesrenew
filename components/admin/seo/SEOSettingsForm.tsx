'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUploader from '@/components/core/ImageUploader';

// Form data interface for SEO settings
interface SEOFormData {
  id: string;
  siteName: string;
  siteUrl: string;
  globalMetaTitle: string;
  globalMetaDescription: string;
  globalKeywords: string;
  defaultSocialShareImage: string;
  faviconUrl: string;
  robotsTxtContent: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
}

interface SEOSettingsFormProps {
  initialData: any;
}

export default function SEOSettingsForm({ initialData }: SEOSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form with the current data
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors } 
  } = useForm<SEOFormData>({
    defaultValues: {
      // Base settings
      id: initialData?.id || 'global',
      siteName: initialData?.siteName || 'Neurowitch',
      siteUrl: initialData?.siteUrl || 'http://localhost:3000',
      
      // SEO fields
      globalMetaTitle: initialData?.globalMetaTitle || '',
      globalMetaDescription: initialData?.globalMetaDescription || '',
      globalKeywords: initialData?.globalKeywords || '',
      defaultSocialShareImage: initialData?.defaultSocialShareImage || '',
      faviconUrl: initialData?.faviconUrl || '',
      robotsTxtContent: initialData?.robotsTxtContent || 'User-agent: *\nAllow: /\n\nDisallow: /admin/',
      googleAnalyticsId: initialData?.googleAnalyticsId || '',
      googleTagManagerId: initialData?.googleTagManagerId || '',
    }
  });

  // Handle form submission
  const onSubmit = async (data: SEOFormData) => {
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/seo/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar la configuración SEO');
      }

      setSuccessMessage('Configuración SEO actualizada correctamente');
      router.refresh(); // Refresh the page to show updated data
    } catch (error: any) {
      console.error('Error saving SEO settings:', error);
      setErrorMessage(error.message || 'Error al guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle regenerating the sitemap
  const handleRegenerateSitemap = async () => {
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/seo/sitemap/regenerate', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al regenerar el sitemap');
      }

      setSuccessMessage('Sitemap regenerado correctamente');
    } catch (error: any) {
      console.error('Error regenerating sitemap:', error);
      setErrorMessage(error.message || 'Error al regenerar el sitemap');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="meta">Meta Tags</TabsTrigger>
          <TabsTrigger value="robots">Robots.txt</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre del Sitio <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('siteName', { required: 'Este campo es obligatorio' })}
                    placeholder="Nombre del sitio"
                    className={errors.siteName ? 'border-red-500' : ''}
                  />
                  {errors.siteName && (
                    <p className="text-red-500 text-sm mt-1">{errors.siteName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    URL del Sitio <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('siteUrl', { 
                      required: 'Este campo es obligatorio',
                      pattern: {
                        value: /^(https?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
                        message: 'Debe ser una URL válida, ej: https://www.ejemplo.com'
                      }
                    })}
                    placeholder="https://www.ejemplo.com"
                    className={errors.siteUrl ? 'border-red-500' : ''}
                  />
                  {errors.siteUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.siteUrl.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Favicon
                  </label>
                  <Controller
                    name="faviconUrl"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <ImageUploader
                          value={field.value}
                          onChange={field.onChange}
                          label="Subir Favicon"
                        />
                        {field.value && (
                          <div className="mt-2 flex items-center">
                            <img 
                              src={field.value} 
                              alt="Favicon" 
                              className="w-8 h-8 mr-2"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <span className="text-sm text-gray-500">Favicon actual</span>
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Imagen por Defecto para Redes Sociales
                  </label>
                  <Controller
                    name="defaultSocialShareImage"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <ImageUploader
                          value={field.value}
                          onChange={field.onChange}
                          label="Subir Imagen para Redes Sociales"
                        />
                        {field.value && (
                          <div className="mt-2">
                            <img 
                              src={field.value} 
                              alt="Imagen Redes Sociales" 
                              className="max-h-32 rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meta Tags Tab */}
        <TabsContent value="meta">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Título Meta Global
                  </label>
                  <Input
                    {...register('globalMetaTitle')}
                    placeholder="Título por defecto para todas las páginas"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Si no se especifica, se usará el nombre del sitio
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Descripción Meta Global
                  </label>
                  <Textarea
                    {...register('globalMetaDescription')}
                    placeholder="Descripción por defecto para todas las páginas"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Recomendado: 150-160 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Palabras Clave Globales
                  </label>
                  <Textarea
                    {...register('globalKeywords')}
                    placeholder="palabra clave 1, palabra clave 2, etc"
                    rows={2}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separadas por comas. Recomendado: 5-10 palabras clave relevantes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Robots.txt Tab */}
        <TabsContent value="robots">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Contenido de Robots.txt
                  </label>
                  <Textarea
                    {...register('robotsTxtContent')}
                    placeholder="User-agent: *\nAllow: /\n\nDisallow: /admin/"
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Se añade automáticamente la directiva Sitemap si no está incluida
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ID de Google Analytics
                  </label>
                  <Input
                    {...register('googleAnalyticsId')}
                    placeholder="G-XXXXXXXXXX o UA-XXXXXXXX-X"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Formato G-XXXXXXXXXX para GA4 o UA-XXXXXXXX-X para Universal Analytics
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    ID de Google Tag Manager
                  </label>
                  <Input
                    {...register('googleTagManagerId')}
                    placeholder="GTM-XXXXXXX"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Formato GTM-XXXXXXX
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-between">
        <Button 
          type="button" 
          onClick={handleRegenerateSitemap}
          variant="outline"
          disabled={isLoading}
        >
          Regenerar Sitemap
        </Button>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </form>
  );
}
