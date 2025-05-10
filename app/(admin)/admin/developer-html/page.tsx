'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Role } from "@/lib/auth-client";
import { useCurrentUserRole, checkUserRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * Página de administración para edición de HTML personalizado (Master)
 * 
 * IMPORTANTE: Esta página debe ser accesible SOLO para usuarios con rol MASTER
 * debido al riesgo de seguridad de XSS que implica la inyección de HTML arbitrario.
 */
export default function DeveloperHtmlPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialContent, setInitialContent] = useState<string>('');

  // 1. Obtener el rol del usuario actual
  const userRole = useCurrentUserRole();
  
  // 2. Configurar react-hook-form
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      htmlContent: '',
    }
  });

  // 3. Verificar si el usuario tiene el rol MASTER
  // Si no, redirigir a página no autorizada
  if (userRole !== null && !checkUserRole(userRole, Role.MASTER)) {
    redirect('/unauthorized');
  }

  // 4. Cargar el contenido HTML actual al iniciar
  useEffect(() => {
    async function loadCurrentContent() {
      try {
        const response = await fetch('/api/settings/developer-html');
        if (!response.ok) {
          throw new Error('Error al cargar el contenido HTML');
        }
        const data = await response.json();
        setInitialContent(data.htmlContent || '');
        setValue('htmlContent', data.htmlContent || '');
      } catch (err) {
        console.error('Error fetching HTML content:', err);
        setError('No se pudo cargar el contenido actual. Por favor, intente de nuevo.');
      }
    }
    
    loadCurrentContent();
  }, [setValue]);

  // 5. Función para enviar el formulario
  const onSubmit = async (data: { htmlContent: string }) => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    
    try {
      const response = await fetch('/api/settings/developer-html', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ htmlContent: data.htmlContent }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el contenido HTML');
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving HTML content:', err);
      setError(err.message || 'Error al guardar el contenido HTML');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Contenido HTML Personalizado (Master)</h1>

      {/* Advertencia de seguridad XSS - Prominente y clara */}
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-bold">ADVERTENCIA DE SEGURIDAD</AlertTitle>
        <AlertDescription>
          Editar este contenido permite inyectar HTML y JavaScript arbitrario. 
          Esto puede crear vulnerabilidades de seguridad graves (XSS) si no se usa con cuidado.
          Solo los administradores Master deben usar esta función.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="htmlContent" className="block text-sm font-medium mb-2">
            Contenido HTML Personalizado
          </label>
          <Textarea
            id="htmlContent"
            {...register('htmlContent', { required: 'Este campo es obligatorio' })}
            className="min-h-[300px] font-mono"
            placeholder="<!-- Ingrese su código HTML personalizado aquí -->"
          />
          {errors.htmlContent && (
            <p className="text-red-500 mt-1">{errors.htmlContent.message}</p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-100 text-green-800 border border-green-300">
            <AlertDescription>
              El contenido HTML se ha guardado correctamente.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          disabled={loading}
          className="bg-primary text-white"
        >
          {loading ? 'Guardando...' : 'Guardar Contenido HTML'}
        </Button>
      </form>
    </div>
  );
}
