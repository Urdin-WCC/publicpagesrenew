'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PresetForm from '@/components/admin/theme/PresetForm';
import { ThemeConfig } from '@/types/theme';

interface ThemePreset {
  id: number;
  name: string;
  config: ThemeConfig;
}

export default function EditThemePage() {
  const params = useParams();
  const router = useRouter();
  const [preset, setPreset] = useState<ThemePreset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTheme() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/theme/presets/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Tema no encontrado');
          } else {
            const error = await response.json();
            setError(error.error || 'Error al cargar el tema');
          }
          return;
        }

        const data = await response.json();
        
        // Convert the theme config from string to object if needed
        let configObj = data.config;
        if (typeof configObj === 'string') {
          try {
            configObj = JSON.parse(configObj);
          } catch (e) {
            console.error('Error parsing theme config:', e);
            setError('Error al procesar la configuración del tema');
            return;
          }
        }

        setPreset({
          id: data.id,
          name: data.name,
          config: configObj
        });
      } catch (e) {
        console.error('Error fetching theme:', e);
        setError('Error al cargar el tema');
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchTheme();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Editar Tema</h1>
        <div className="text-center p-8">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Editar Tema</h1>
        <div className="text-center p-8 text-red-500">
          {error}
          <div className="mt-4">
            <button 
              className="text-blue-500 hover:underline" 
              onClick={() => router.push('/admin/theme')}
            >
              Volver a la lista de temas
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!preset) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Editar Tema</h1>
        <div className="text-center p-8">
          Tema no encontrado
          <div className="mt-4">
            <button 
              className="text-blue-500 hover:underline" 
              onClick={() => router.push('/admin/theme')}
            >
              Volver a la lista de temas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Editar Tema: {preset.name}</h1>
      <PresetForm preset={preset} isEditing={true} />
    </div>
  );
}
