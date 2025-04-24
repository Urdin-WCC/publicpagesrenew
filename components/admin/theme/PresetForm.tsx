'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ThemeConfig } from '@/types/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Componentes del formulario
import { BackgroundSection } from './components/BackgroundSection';
import { TypographySection } from './components/TypographySection';
import { ButtonsSection } from './components/ButtonsSection';
import { CardsSection } from './components/CardsSection';
import { FormsSection } from './components/FormsSection';
import { SpacingSection } from './components/SpacingSection';
import { EffectsSection } from './components/EffectsSection';

interface FormData {
  name: string;
  config: ThemeConfig;
}

interface PresetFormProps {
  preset?: {
    id: number;
    name: string;
    config: ThemeConfig;
  };
  isEditing?: boolean;
}

export default function PresetForm({ preset, isEditing = false }: PresetFormProps) {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: preset ? {
      name: preset.name,
      config: preset.config,
    } : {
      name: '',
      config: {
        background: { type: 'color', value: '#ffffff' },
        typography: {
          heading: { fontFamily: 'Arial, sans-serif', color: '#333333' },
          paragraph: { fontFamily: 'Arial, sans-serif', color: '#666666' },
          link: { fontFamily: 'Arial, sans-serif', color: '#007bff', hoverColor: '#0056b3' },
        },
        spacing: { 
          margin: { top: '1rem', right: '1rem', bottom: '1rem', left: '1rem', base: '1rem' },
          padding: { top: '1rem', right: '1rem', bottom: '1rem', left: '1rem', base: '1rem' }
        },
        cards: {
          borderRadius: '0.5rem',
          borderWidth: '1px',
          borderColor: 'rgba(0,0,0,0.1)',
          background: { type: 'color', value: '#ffffff' },
          shadow: {
            x: '0px',
            y: '4px',
            blur: '6px',
            spread: '0px',
            color: 'rgba(0,0,0,0.1)'
          },
        },
        buttons: {
          primary: {
            backgroundColor: '#007bff',
            textColor: '#ffffff',
            borderRadius: '0.25rem',
            hoverBackgroundColor: '#0069d9',
            hoverTextColor: '#ffffff',
          },
          secondary: {
            backgroundColor: '#6c757d',
            textColor: '#ffffff',
            borderRadius: '0.25rem',
            hoverBackgroundColor: '#5a6268',
            hoverTextColor: '#ffffff',
          },
        },
        forms: {
          input: {
            backgroundColor: '#ffffff',
            textColor: '#495057',
            borderColor: '#ced4da',
            borderRadius: '0.25rem',
            focusBorderColor: '#80bdff',
          },
          label: {
            textColor: '#212529',
            fontWeight: 'bold',
          },
        },
        effects: {
          transitions: true,
          animation: 'none',
          customAnimation: '',
        },
      },
    },
  });

  const watchedConfig = watch('config');
  const [activeTab, setActiveTab] = useState<string>("general");

  // Manejador para actualizar la configuración
  const handleConfigChange = (newConfig: ThemeConfig) => {
    setValue('config', newConfig, { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    try {
      let response;

      if (isEditing && preset) {
        // Update existing preset
        response = await fetch(`/api/theme/presets/${preset.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } else {
        // Create new preset
        response = await fetch('/api/theme/presets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }

      if (response.ok) {
        // Navigate back to the theme list page
        router.push('/admin/theme');
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'No se pudo guardar el tema'}`);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Error al guardar el tema');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Tema</Label>
        <Input
          id="name"
          placeholder="Nombre del tema"
          {...register('name', { required: 'El nombre es obligatorio' })}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      {/* Pestañas para secciones de temas */}
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="typography">Tipografía</TabsTrigger>
          <TabsTrigger value="buttons">Botones</TabsTrigger>
          <TabsTrigger value="cards">Tarjetas</TabsTrigger>
          <TabsTrigger value="forms">Formularios</TabsTrigger>
          <TabsTrigger value="spacing">Espaciado</TabsTrigger>
          <TabsTrigger value="effects">Efectos</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          {/* Sección General (Fondo) */}
          <TabsContent value="general">
            <BackgroundSection config={watchedConfig} onChange={handleConfigChange} />
          </TabsContent>
          
          {/* Sección Tipografía */}
          <TabsContent value="typography">
            <TypographySection config={watchedConfig} onChange={handleConfigChange} />
          </TabsContent>
          
          {/* Sección Botones */}
          <TabsContent value="buttons">
            <ButtonsSection config={watchedConfig} onChange={handleConfigChange} />
          </TabsContent>
          
          {/* Sección Tarjetas */}
          <TabsContent value="cards">
            <CardsSection config={watchedConfig} onChange={handleConfigChange} />
          </TabsContent>
          
          {/* Sección Formularios */}
          <TabsContent value="forms">
            <FormsSection config={watchedConfig} onChange={handleConfigChange} />
          </TabsContent>
          
          {/* Sección Espaciado */}
          <TabsContent value="spacing">
            <SpacingSection config={watchedConfig} onChange={handleConfigChange} />
          </TabsContent>
          
          {/* Sección Efectos */}
          <TabsContent value="effects">
            <EffectsSection config={watchedConfig} onChange={handleConfigChange} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Botones de control */}
      <div className="flex justify-end space-x-2 pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push('/admin/theme')}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isEditing ? 'Guardar Cambios' : 'Crear Tema'}
        </Button>
      </div>
      
      {/* Navegación entre pestañas */}
      <div className="flex justify-between pt-4 pb-8">
        <Button 
          type="button"
          variant="ghost"
          disabled={activeTab === "general"}
          onClick={() => {
            const tabs = ["general", "typography", "buttons", "cards", "forms", "spacing", "effects"];
            const currentIndex = tabs.indexOf(activeTab);
            if (currentIndex > 0) {
              setActiveTab(tabs[currentIndex - 1]);
            }
          }}
        >
          ← Anterior
        </Button>
        
        <Button 
          type="button"
          variant="ghost"
          disabled={activeTab === "effects"}
          onClick={() => {
            const tabs = ["general", "typography", "buttons", "cards", "forms", "spacing", "effects"];
            const currentIndex = tabs.indexOf(activeTab);
            if (currentIndex < tabs.length - 1) {
              setActiveTab(tabs[currentIndex + 1]);
            }
          }}
        >
          Siguiente →
        </Button>
      </div>
    </form>
  );
}
