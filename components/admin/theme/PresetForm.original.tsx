'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { SketchPicker, ColorResult } from 'react-color';
import { ThemeConfig } from '@/types/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploader } from '@/components/core/ImageUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

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
  // Opciones de fuentes comunes
  const commonFonts = [
    "Arial, sans-serif",
    "Helvetica, Arial, sans-serif",
    "Georgia, serif",
    "Times New Roman, serif",
    "Courier New, monospace",
    "Verdana, sans-serif",
    "Tahoma, sans-serif",
    "Trebuchet MS, sans-serif",
    "Impact, sans-serif",
    "Comic Sans MS, cursive",
    "Roboto, sans-serif",
    "Open Sans, sans-serif",
    "Lato, sans-serif",
    "Montserrat, sans-serif",
    "Raleway, sans-serif",
    "Poppins, sans-serif",
    "Merriweather, serif",
    "Playfair Display, serif"
  ];
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
        },
      },
    },
  });

  const watchedConfig = watch('config');

  // Function to update color in the form data
  const handleColorChange = (colorPath: string, color: ColorResult) => {
    const rgba = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
    const pathArray = colorPath.split('.');
    
    // Create a deep copy of the config
    const newConfig = { ...watchedConfig };
    
    // Navigate to the right nested property
    let current: any = newConfig;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    // Set the color value
    current[pathArray[pathArray.length - 1]] = rgba;
    
    // Update the form
    setValue('config', newConfig, { shouldValidate: true });
  };

  // Handle image upload
  const handleImageUpload = (imagePath: string, url: string) => {
    const pathArray = imagePath.split('.');
    
    // Create a deep copy of the config
    const newConfig = { ...watchedConfig };
    
    // Navigate to the right nested property
    let current: any = newConfig;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    // Set the image URL
    current[pathArray[pathArray.length - 1]] = url;
    
    // Update the form
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

  // Helper function to get a nested value from an object using a path string
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  };

  // Enhanced Color picker component with label and gradient support
  const ColorPicker = ({ 
    label, 
    path, 
    supportGradient = false,
    showAlpha = true
  }: { 
    label: string; 
    path: string;
    supportGradient?: boolean;
    showAlpha?: boolean;
  }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [tempColor, setTempColor] = useState<ColorResult | null>(null);
    const [pickerType, setPickerType] = useState<'color' | 'gradient'>('color');
    const colorValue = getNestedValue(watchedConfig, path) || '#ffffff';
    const [gradientValue, setGradientValue] = useState<string>(
      colorValue.startsWith('linear-gradient') || colorValue.startsWith('radial-gradient') 
        ? colorValue 
        : 'linear-gradient(to right, rgba(0,123,255,1), rgba(0,188,212,1))'
    );
    const [gradientType, setGradientType] = useState<'linear' | 'radial'>(
      colorValue.startsWith('radial-gradient') ? 'radial' : 'linear'
    );
    const [gradientDirection, setGradientDirection] = useState<string>(
      colorValue.startsWith('linear-gradient') 
        ? colorValue.match(/linear-gradient\((.*?),/)?.[1] || 'to right'
        : 'at center'
    );
    
    // Extract gradient stops for preview
    const [gradientStops, setGradientStops] = useState<{color: string, position: number}[]>(() => {
      if (colorValue.startsWith('linear-gradient') || colorValue.startsWith('radial-gradient')) {
        const stopsMatch = colorValue.match(/gradient\(.*?,\s*(.*)\)/)?.[1];
        if (stopsMatch) {
          const stops = stopsMatch.split(',').map(stop => {
            const parts = stop.trim().split(/\s+/);
            const color = parts[0];
            const position = parts[1] ? parseInt(parts[1].replace('%', '')) : 0;
            return { color, position: isNaN(position) ? 0 : position };
          });
          return stops;
        }
      }
      return [
        { color: 'rgba(0,123,255,1)', position: 0 },
        { color: 'rgba(0,188,212,1)', position: 100 }
      ];
    });

    useEffect(() => {
      if (colorValue.startsWith('linear-gradient') || colorValue.startsWith('radial-gradient')) {
        setPickerType('gradient');
        setGradientValue(colorValue);
        setGradientType(colorValue.startsWith('radial-gradient') ? 'radial' : 'linear');
        
        // Extract direction
        const directionMatch = colorValue.match(/gradient\((.*?),/)?.[1];
        if (directionMatch) {
          setGradientDirection(directionMatch);
        }
      } else {
        setPickerType('color');
      }
    }, [colorValue]);

    const handleColorConfirm = () => {
      if (pickerType === 'color' && tempColor) {
        handleColorChange(path, tempColor);
      } else if (pickerType === 'gradient') {
        // Construct gradient string
        const prefix = gradientType === 'linear' ? 'linear-gradient' : 'radial-gradient';
        const direction = gradientType === 'linear' ? gradientDirection : gradientDirection;
        
        // Sort stops by position
        const sortedStops = [...gradientStops].sort((a, b) => a.position - b.position);
        
        // Create stops string
        const stopsString = sortedStops.map(stop => 
          `${stop.color} ${stop.position}%`
        ).join(', ');
        
        const finalGradient = `${prefix}(${direction}, ${stopsString})`;
        
        // Update form
        const newConfig = { ...watchedConfig };
        const pathArray = path.split('.');
        
        // Navigate to the right nested property
        let current: any = newConfig;
        for (let i = 0; i < pathArray.length - 1; i++) {
          if (!current[pathArray[i]]) {
            current[pathArray[i]] = {};
          }
          current = current[pathArray[i]];
        }
        
        // Set the gradient value
        current[pathArray[pathArray.length - 1]] = finalGradient;
        
        // Update the form
        setValue('config', newConfig, { shouldValidate: true });
      }
      setShowPicker(false);
      setTempColor(null);
    };

    // Add new gradient stop
    const addGradientStop = () => {
      const newPos = 50; // Default mid-point
      setGradientStops([...gradientStops, { color: 'rgba(255,255,255,1)', position: newPos }]);
    };

    // Remove gradient stop
    const removeGradientStop = (index: number) => {
      if (gradientStops.length > 2) {
        const newStops = [...gradientStops];
        newStops.splice(index, 1);
        setGradientStops(newStops);
      }
    };

    // Update gradient stop color
    const updateGradientStopColor = (index: number, color: ColorResult) => {
      const rgba = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
      const newStops = [...gradientStops];
      newStops[index].color = rgba;
      setGradientStops(newStops);
    };

    // Update gradient stop position
    const updateGradientStopPosition = (index: number, position: number) => {
      const newStops = [...gradientStops];
      newStops[index].position = position;
      setGradientStops(newStops);
    };

    // Preview of the current gradient
    const gradientPreview = () => {
      const prefix = gradientType === 'linear' ? 'linear-gradient' : 'radial-gradient';
      const direction = gradientType === 'linear' ? gradientDirection : gradientDirection;
      
      // Sort stops by position for the preview
      const sortedStops = [...gradientStops].sort((a, b) => a.position - b.position);
      const stopsString = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
      
      return `${prefix}(${direction}, ${stopsString})`;
    };

    return (
      <div className="space-y-2 mb-4">
        <Label>{label}</Label>
        <div className="flex items-center space-x-2">
          <div 
            className="w-10 h-10 rounded border cursor-pointer"
            style={{ 
              background: pickerType === 'gradient' ? gradientPreview() : colorValue
            }}
            onClick={() => setShowPicker(!showPicker)}
          />
          <Input
            value={pickerType === 'gradient' ? gradientPreview() : colorValue}
            readOnly
            onClick={() => setShowPicker(!showPicker)}
            className="cursor-pointer"
          />
        </div>
        {showPicker && (
          <div className="absolute z-10">
            <div className="p-4 rounded-md shadow-lg bg-white" style={{ width: '300px' }}>
              {supportGradient && (
                <div className="flex justify-center space-x-2 mb-3">
                  <Button
                    type="button"
                    variant={pickerType === 'color' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPickerType('color')}
                  >
                    Color Sólido
                  </Button>
                  <Button
                    type="button"
                    variant={pickerType === 'gradient' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPickerType('gradient')}
                  >
                    Degradado
                  </Button>
                </div>
              )}
              
              {pickerType === 'color' ? (
                <SketchPicker
                  color={colorValue}
                  onChange={(color) => setTempColor(color)}
                  disableAlpha={!showAlpha}
                  width="100%"
                />
              ) : (
                <div className="space-y-3">
                  <div 
                    className="w-full h-16 rounded"
                    style={{ background: gradientPreview() }}
                  />
                  
                  <div className="space-y-2">
                    <Label>Tipo de Degradado</Label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={gradientType === 'linear' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGradientType('linear')}
                        className="flex-1"
                      >
                        Lineal
                      </Button>
                      <Button
                        type="button"
                        variant={gradientType === 'radial' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGradientType('radial')}
                        className="flex-1"
                      >
                        Radial
                      </Button>
                    </div>
                  </div>
                  
                  {gradientType === 'linear' && (
                    <div className="space-y-2">
                      <Label>Dirección</Label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={gradientDirection}
                        onChange={(e) => setGradientDirection(e.target.value)}
                      >
                        <option value="to right">→ Derecha</option>
                        <option value="to left">← Izquierda</option>
                        <option value="to bottom">↓ Abajo</option>
                        <option value="to top">↑ Arriba</option>
                        <option value="to bottom right">↘ Abajo-Derecha</option>
                        <option value="to bottom left">↙ Abajo-Izquierda</option>
                        <option value="to top right">↗ Arriba-Derecha</option>
                        <option value="to top left">↖ Arriba-Izquierda</option>
                        <option value="45deg">45° (Diagonal)</option>
                        <option value="90deg">90° (Vertical)</option>
                        <option value="135deg">135° (Diagonal)</option>
                        <option value="180deg">180° (Horizontal)</option>
                        <option value="225deg">225° (Diagonal)</option>
                        <option value="270deg">270° (Vertical)</option>
                        <option value="315deg">315° (Diagonal)</option>
                      </select>
                    </div>
                  )}
                  
                  {gradientType === 'radial' && (
                    <div className="space-y-2">
                      <Label>Posición</Label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={gradientDirection}
                        onChange={(e) => setGradientDirection(e.target.value)}
                      >
                        <option value="at center">Centro</option>
                        <option value="at left top">Arriba-Izquierda</option>
                        <option value="at center
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { SketchPicker, ColorResult } from 'react-color';
import { ThemeConfig } from '@/types/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploader } from '@/components/core/ImageUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

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
  // Opciones de fuentes comunes
  const commonFonts = [
    "Arial, sans-serif",
    "Helvetica, Arial, sans-serif",
    "Georgia, serif",
    "Times New Roman, serif",
    "Courier New, monospace",
    "Verdana, sans-serif",
    "Tahoma, sans-serif",
    "Trebuchet MS, sans-serif",
    "Impact, sans-serif",
    "Comic Sans MS, cursive",
    "Roboto, sans-serif",
    "Open Sans, sans-serif",
    "Lato, sans-serif",
    "Montserrat, sans-serif",
    "Raleway, sans-serif",
    "Poppins, sans-serif",
    "Merriweather, serif",
    "Playfair Display, serif"
  ];
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
        },
      },
    },
  });

  const watchedConfig = watch('config');

  // Function to update color in the form data
  const handleColorChange = (colorPath: string, color: ColorResult) => {
    const rgba = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
    const pathArray = colorPath.split('.');
    
    // Create a deep copy of the config
    const newConfig = { ...watchedConfig };
    
    // Navigate to the right nested property
    let current: any = newConfig;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    // Set the color value
    current[pathArray[pathArray.length - 1]] = rgba;
    
    // Update the form
    setValue('config', newConfig, { shouldValidate: true });
  };

  // Handle image upload
  const handleImageUpload = (imagePath: string, url: string) => {
    const pathArray = imagePath.split('.');
    
    // Create a deep copy of the config
    const newConfig = { ...watchedConfig };
    
    // Navigate to the right nested property
    let current: any = newConfig;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    // Set the image URL
    current[pathArray[pathArray.length - 1]] = url;
    
    // Update the form
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

  // Helper function to get a nested value from an object using a path string
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  };

  // Color picker component with label
  const ColorPicker = ({ label, path }: { label: string; path: string }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [tempColor, setTempColor] = useState<ColorResult | null>(null);
    const colorValue = getNestedValue(watchedConfig, path) || '#ffffff';

    const handleColorConfirm = () => {
      if (tempColor) {
        handleColorChange(path, tempColor);
      }
      setShowPicker(false);
      setTempColor(null);
    };

    return (
      <div className="space-y-2 mb-4">
        <Label>{label}</Label>
        <div className="flex items-center space-x-2">
          <div 
            className="w-10 h-10 rounded border cursor-pointer"
            style={{ backgroundColor: colorValue }}
            onClick={() => setShowPicker(!showPicker)}
          />
          <Input
            value={colorValue}
            readOnly
            onClick={() => setShowPicker(!showPicker)}
            className="cursor-pointer"
          />
        </div>
        {showPicker && (
          <div className="absolute z-10">
            <div className="p-4 rounded-md shadow-lg bg-white">
              <SketchPicker
                color={colorValue}
                onChange={(color) => setTempColor(color)}
              />
              <div className="mt-3 flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowPicker(false);
                    setTempColor(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={handleColorConfirm}
                  size="sm"
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Background Section */}
        <Card>
          <CardHeader>
            <CardTitle>Fondo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Fondo</Label>
              <div className="flex space-x-2">
                <Button 
                  type="button"
                  variant={watchedConfig.background?.type === 'color' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.background) newConfig.background = { type: 'color', value: '#ffffff' };
                    newConfig.background.type = 'color';
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                >
                  Color
                </Button>
                <Button 
                  type="button"
                  variant={watchedConfig.background?.type === 'gradient' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.background) newConfig.background = { type: 'gradient', value: 'linear-gradient(to right, #007bff, #00bcd4)' };
                    newConfig.background.type = 'gradient';
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                >
                  Gradiente
                </Button>
                <Button 
                  type="button"
                  variant={watchedConfig.background?.type === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.background) newConfig.background = { type: 'image', value: 'rgba(255,255,255,0.8)', imageUrl: '' };
                    newConfig.background.type = 'image';
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                >
                  Imagen
                </Button>
              </div>
            </div>
            
            {watchedConfig.background?.type === 'color' && (
              <ColorPicker 
                label="Color de Fondo" 
                path="background.value" 
              />
            )}
            
            {watchedConfig.background?.type === 'gradient' && (
              <div className="space-y-2">
                <Label>Gradiente</Label>
                <Input
                  value={watchedConfig.background?.value || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.background) newConfig.background = { type: 'gradient', value: e.target.value };
                    newConfig.background.value = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="linear-gradient(to right, #007bff, #00bcd4)"
                />
              </div>
            )}
            
            {watchedConfig.background?.type === 'image' && (
              <>
                <ColorPicker 
                  label="Color de Fondo (Debajo de la imagen)" 
                  path="background.value" 
                />
                <div className="space-y-2">
                  <Label>Imagen de Fondo</Label>
                  <div className="mb-2">
                    {watchedConfig.background?.imageUrl && (
                      <div className="h-32 w-full bg-gray-100 rounded-md overflow-hidden relative mb-2">
                        <div 
                          className="absolute inset-0 bg-cover bg-center" 
                          style={{ backgroundImage: `url(${watchedConfig.background.imageUrl})` }}
                        />
                      </div>
                    )}
                  </div>
                  <ImageUploader
                    onChange={(url) => handleImageUpload("background.imageUrl", url)}
                    label="Seleccionar Imagen"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Typography Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tipografía</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Títulos */}
            <div className="border rounded-md p-3 pb-1">
              <h3 className="font-medium mb-3">Configuración de Títulos</h3>
              
              {/* Fuente */}
              <div className="space-y-2 mb-4">
                <Label>Fuente</Label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={watchedConfig.typography?.heading?.fontFamily || ''}
                    onChange={(e) => {
                      const newConfig = { ...watchedConfig };
                      if (!newConfig.typography) newConfig.typography = {};
                      if (!newConfig.typography.heading) newConfig.typography.heading = {};
                      newConfig.typography.heading.fontFamily = e.target.value;
                      setValue('config', newConfig, { shouldValidate: true });
                    }}
                  >
                    <option value="">-- Seleccionar Fuente --</option>
                    {commonFonts.map(font => (
                      <option key={font} value={font} style={{ fontFamily: font }}>{font.split(',')[0]}</option>
                    ))}
                  </select>
                  
                  <Input
                    placeholder="o escribe una fuente personalizada"
                    value={watchedConfig.typography?.heading?.fontFamily || ''}
                    onChange={(e) => {
                      const newConfig = { ...watchedConfig };
                      if (!newConfig.typography) newConfig.typography = {};
                      if (!newConfig.typography.heading) newConfig.typography.heading = {};
                      newConfig.typography.heading.fontFamily = e.target.value;
                      setValue('config', newConfig, { shouldValidate: true });
                    }}
                  />
                </div>
              </div>
              
              {/* Tamaño */}
              <div className="space-y-2 mb-4">
                <Label>Tamaño de Texto</Label>
                <Input
                  type="text"
                  placeholder="ej: 1.5rem, 24px"
                  value={watchedConfig.typography?.heading?.fontSize || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.typography) newConfig.typography = {};
                    if (!newConfig.typography.heading) newConfig.typography.heading = {};
                    newConfig.typography.heading.fontSize = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                />
              </div>
              
              {/* Grosor */}
              <div className="space-y-2 mb-4">
                <Label>Grosor de Texto</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={watchedConfig.typography?.heading?.fontWeight || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.typography) newConfig.typography = {};
                    if (!newConfig.typography.heading) newConfig.typography.heading = {};
                    newConfig.typography.heading.fontWeight = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                >
                  <option value="">Normal</option>
                  <option value="300">Ligero (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="500">Medio (500)</option>
                  <option value="600">Semi-Negrita (600)</option>
                  <option value="700">Negrita (700)</option>
                  <option value="800">Extra-Negrita (800)</option>
                  <option value="900">Negro (900)</option>
                </select>
              </div>
              
              {/* Estilo y decoración */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Estilo</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={watchedConfig.typography?.heading?.fontStyle || ''}
                    onChange={(e) => {
                      const newConfig = { ...watchedConfig };
                      if (!newConfig.typography) newConfig.typography = {};
                      if (!newConfig.typography.heading) newConfig.typography.heading = {};
                      newConfig.typography.heading.fontStyle = e.target.value;
                      setValue('config', newConfig, { shouldValidate: true });
                    }}
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Cursiva</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Transformación</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={watchedConfig.typography?.heading?.textTransform || ''}
                    onChange={(e) => {
                      const newConfig = { ...watchedConfig };
                      if (!newConfig.typography) newConfig.typography = {};
                      if (!newConfig.typography.heading) newConfig.typography.heading = {};
                      newConfig.typography.heading.textTransform = e.target.value;
                      setValue('config', newConfig, { shouldValidate: true });
                    }}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { SketchPicker, ColorResult } from 'react-color';
import { ThemeConfig } from '@/types/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploader } from '@/components/core/ImageUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

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
  // Opciones de fuentes comunes
  const commonFonts = [
    "Arial, sans-serif",
    "Helvetica, Arial, sans-serif",
    "Georgia, serif",
    "Times New Roman, serif",
    "Courier New, monospace",
    "Verdana, sans-serif",
    "Tahoma, sans-serif",
    "Trebuchet MS, sans-serif",
    "Impact, sans-serif",
    "Comic Sans MS, cursive",
    "Roboto, sans-serif",
    "Open Sans, sans-serif",
    "Lato, sans-serif",
    "Montserrat, sans-serif",
    "Raleway, sans-serif",
    "Poppins, sans-serif",
    "Merriweather, serif",
    "Playfair Display, serif"
  ];
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
        },
      },
    },
  });

  const watchedConfig = watch('config');

  // Function to update color in the form data
  const handleColorChange = (colorPath: string, color: ColorResult) => {
    const rgba = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
    const pathArray = colorPath.split('.');
    
    // Create a deep copy of the config
    const newConfig = { ...watchedConfig };
    
    // Navigate to the right nested property
    let current: any = newConfig;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    // Set the color value
    current[pathArray[pathArray.length - 1]] = rgba;
    
    // Update the form
    setValue('config', newConfig, { shouldValidate: true });
  };

  // Handle image upload
  const handleImageUpload = (imagePath: string, url: string) => {
    const pathArray = imagePath.split('.');
    
    // Create a deep copy of the config
    const newConfig = { ...watchedConfig };
    
    // Navigate to the right nested property
    let current: any = newConfig;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    // Set the image URL
    current[pathArray[pathArray.length - 1]] = url;
    
    // Update the form
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

  // Helper function to get a nested value from an object using a path string
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  };

  // Enhanced Color picker component with label and gradient support
  const ColorPicker = ({ 
    label, 
    path, 
    supportGradient = false,
    showAlpha = true
  }: { 
    label: string; 
    path: string;
    supportGradient?: boolean;
    showAlpha?: boolean;
  }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [tempColor, setTempColor] = useState<ColorResult | null>(null);
    const [pickerType, setPickerType] = useState<'color' | 'gradient'>('color');
    const colorValue = getNestedValue(watchedConfig, path) || '#ffffff';
    const [gradientValue, setGradientValue] = useState<string>(
      colorValue.startsWith('linear-gradient') || colorValue.startsWith('radial-gradient') 
        ? colorValue 
        : 'linear-gradient(to right, rgba(0,123,255,1), rgba(0,188,212,1))'
    );
    const [gradientType, setGradientType] = useState<'linear' | 'radial'>(
      colorValue.startsWith('radial-gradient') ? 'radial' : 'linear'
    );
    const [gradientDirection, setGradientDirection] = useState<string>(
      colorValue.startsWith('linear-gradient') 
        ? colorValue.match(/linear-gradient\((.*?),/)?.[1] || 'to right'
        : 'at center'
    );
    
    // Extract gradient stops for preview
    const [gradientStops, setGradientStops] = useState<{color: string, position: number}[]>(() => {
      if (colorValue.startsWith('linear-gradient') || colorValue.startsWith('radial-gradient')) {
        const stopsMatch = colorValue.match(/gradient\(.*?,\s*(.*)\)/)?.[1];
        if (stopsMatch) {
          const stops = stopsMatch.split(',').map(stop => {
            const parts = stop.trim().split(/\s+/);
            const color = parts[0];
            const position = parts[1] ? parseInt(parts[1].replace('%', '')) : 0;
            return { color, position: isNaN(position) ? 0 : position };
          });
          return stops;
        }
      }
      return [
        { color: 'rgba(0,123,255,1)', position: 0 },
        { color: 'rgba(0,188,212,1)', position: 100 }
      ];
    });

    useEffect(() => {
      if (colorValue.startsWith('linear-gradient') || colorValue.startsWith('radial-gradient')) {
        setPickerType('gradient');
        setGradientValue(colorValue);
        setGradientType(colorValue.startsWith('radial-gradient') ? 'radial' : 'linear');
        
        // Extract direction
        const directionMatch = colorValue.match(/gradient\((.*?),/)?.[1];
        if (directionMatch) {
          setGradientDirection(directionMatch);
        }
      } else {
        setPickerType('color');
      }
    }, [colorValue]);

    const handleColorConfirm = () => {
      if (pickerType === 'color' && tempColor) {
        handleColorChange(path, tempColor);
      } else if (pickerType === 'gradient') {
        // Construct gradient string
        const prefix = gradientType === 'linear' ? 'linear-gradient' : 'radial-gradient';
        const direction = gradientType === 'linear' ? gradientDirection : gradientDirection;
        
        // Sort stops by position
        const sortedStops = [...gradientStops].sort((a, b) => a.position - b.position);
        
        // Create stops string
        const stopsString = sortedStops.map(stop => 
          `${stop.color} ${stop.position}%`
        ).join(', ');
        
        const finalGradient = `${prefix}(${direction}, ${stopsString})`;
        
        // Update form
        const newConfig = { ...watchedConfig };
        const pathArray = path.split('.');
        
        // Navigate to the right nested property
        let current: any = newConfig;
        for (let i = 0; i < pathArray.length - 1; i++) {
          if (!current[pathArray[i]]) {
            current[pathArray[i]] = {};
          }
          current = current[pathArray[i]];
        }
        
        // Set the gradient value
        current[pathArray[pathArray.length - 1]] = finalGradient;
        
        // Update the form
        setValue('config', newConfig, { shouldValidate: true });
      }
      setShowPicker(false);
      setTempColor(null);
    };

    // Add new gradient stop
    const addGradientStop = () => {
      const newPos = 50; // Default mid-point
      setGradientStops([...gradientStops, { color: 'rgba(255,255,255,1)', position: newPos }]);
    };

    // Remove gradient stop
    const removeGradientStop = (index: number) => {
      if (gradientStops.length > 2) {
        const newStops = [...gradientStops];
        newStops.splice(index, 1);
        setGradientStops(newStops);
      }
    };

    // Update gradient stop color
    const updateGradientStopColor = (index: number, color: ColorResult) => {
      const rgba = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
      const newStops = [...gradientStops];
      newStops[index].color = rgba;
      setGradientStops(newStops);
    };

    // Update gradient stop position
    const updateGradientStopPosition = (index: number, position: number) => {
      const newStops = [...gradientStops];
      newStops[index].position = position;
      setGradientStops(newStops);
    };

    // Preview of the current gradient
    const gradientPreview = () => {
      const prefix = gradientType === 'linear' ? 'linear-gradient' : 'radial-gradient';
      const direction = gradientType === 'linear' ? gradientDirection : gradientDirection;
      
      // Sort stops by position for the preview
      const sortedStops = [...gradientStops].sort((a, b) => a.position - b.position);
      const stopsString = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
      
      return `${prefix}(${direction}, ${stopsString})`;
    };

    return (
      <div className="space-y-2 mb-4">
        <Label>{label}</Label>
        <div className="flex items-center space-x-2">
          <div 
            className="w-10 h-10 rounded border cursor-pointer"
            style={{ 
              background: pickerType === 'gradient' ? gradientPreview() : colorValue
            }}
            onClick={() => setShowPicker(!showPicker)}
          />
          <Input
            value={pickerType === 'gradient' ? gradientPreview() : colorValue}
            readOnly
            onClick={() => setShowPicker(!showPicker)}
            className="cursor-pointer"
          />
        </div>
        {showPicker && (
          <div className="absolute z-10">
            <div className="p-4 rounded-md shadow-lg bg-white" style={{ width: '300px' }}>
              {supportGradient && (
                <div className="flex justify-center space-x-2 mb-3">
                  <Button
                    type="button"
                    variant={pickerType === 'color' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPickerType('color')}
                  >
                    Color Sólido
                  </Button>
                  <Button
                    type="button"
                    variant={pickerType === 'gradient' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPickerType('gradient')}
                  >
                    Degradado
                  </Button>
                </div>
              )}
              
              {pickerType === 'color' ? (
                <SketchPicker
                  color={colorValue}
                  onChange={(color) => setTempColor(color)}
                  disableAlpha={!showAlpha}
                  width="100%"
                />
              ) : (
                <div className="space-y-3">
                  <div 
                    className="w-full h-16 rounded"
                    style={{ background: gradientPreview() }}
                  />
                  
                  <div className="space-y-2">
                    <Label>Tipo de Degradado</Label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={gradientType === 'linear' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGradientType('linear')}
                        className="flex-1"
                      >
                        Lineal
                      </Button>
                      <Button
                        type="button"
                        variant={gradientType === 'radial' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGradientType('radial')}
                        className="flex-1"
                      >
                        Radial
                      </Button>
                    </div>
                  </div>
                  
                  {gradientType === 'linear' && (
                    <div className="space-y-2">
                      <Label>Dirección</Label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={gradientDirection}
                        onChange={(e) => setGradientDirection(e.target.value)}
                      >
                        <option value="to right">→ Derecha</option>
                        <option value="to left">← Izquierda</option>
                        <option value="to bottom">↓ Abajo</option>
                        <option value="to top">↑ Arriba</option>
                        <option value="to bottom right">↘ Abajo-Derecha</option>
                        <option value="to bottom left">↙ Abajo-Izquierda</option>
                        <option value="to top right">↗ Arriba-Derecha</option>
                        <option value="to top left">↖ Arriba-Izquierda</option>
                        <option value="45deg">45° (Diagonal)</option>
                        <option value="90deg">90° (Vertical)</option>
                        <option value="135deg">135° (Diagonal)</option>
                        <option value="180deg">180° (Horizontal)</option>
                        <option value="225deg">225° (Diagonal)</option>
                        <option value="270deg">270° (Vertical)</option>
                        <option value="315deg">315° (Diagonal)</option>
                      </select>
                    </div>
                  )}
                  
                  {gradientType === 'radial' && (
                    <div className="space-y-2">
                      <Label>Posición</Label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={gradientDirection}
                        onChange={(e) => setGradientDirection(e.target.value)}
                      >
                        <option value="at center">Centro</option>
                        <option value="at left top">Arriba-Izquierda</option>
                        <option value="at center
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { SketchPicker, ColorResult } from 'react-color';
import { ThemeConfig } from '@/types/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploader } from '@/components/core/ImageUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

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
  // Opciones de fuentes comunes
  const commonFonts = [
    "Arial, sans-serif",
    "Helvetica, Arial, sans-serif",
    "Georgia, serif",
    "Times New Roman, serif",
    "Courier New, monospace",
    "Verdana, sans-serif",
    "Tahoma, sans-serif",
    "Trebuchet MS, sans-serif",
    "Impact, sans-serif",
    "Comic Sans MS, cursive",
    "Roboto, sans-serif",
    "Open Sans, sans-serif",
    "Lato, sans-serif",
    "Montserrat, sans-serif",
    "Raleway, sans-serif",
    "Poppins, sans-serif",
    "Merriweather, serif",
    "Playfair Display, serif"
  ];
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
        },
      },
    },
  });

  const watchedConfig = watch('config');

  // Function to update color in the form data
  const handleColorChange = (colorPath: string, color: ColorResult) => {
    const rgba = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
    const pathArray = colorPath.split('.');
    
    // Create a deep copy of the config
    const newConfig = { ...watchedConfig };
    
    // Navigate to the right nested property
    let current: any = newConfig;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    // Set the color value
    current[pathArray[pathArray.length - 1]] = rgba;
    
    // Update the form
    setValue('config', newConfig, { shouldValidate: true });
  };

  // Handle image upload
  const handleImageUpload = (imagePath: string, url: string) => {
    const pathArray = imagePath.split('.');
    
    // Create a deep copy of the config
    const newConfig = { ...watchedConfig };
    
    // Navigate to the right nested property
    let current: any = newConfig;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    // Set the image URL
    current[pathArray[pathArray.length - 1]] = url;
    
    // Update the form
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

  // Helper function to get a nested value from an object using a path string
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  };

  // Color picker component with label
  const ColorPicker = ({ label, path }: { label: string; path: string }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [tempColor, setTempColor] = useState<ColorResult | null>(null);
    const colorValue = getNestedValue(watchedConfig, path) || '#ffffff';

    const handleColorConfirm = () => {
      if (tempColor) {
        handleColorChange(path, tempColor);
      }
      setShowPicker(false);
      setTempColor(null);
    };

    return (
      <div className="space-y-2 mb-4">
        <Label>{label}</Label>
        <div className="flex items-center space-x-2">
          <div 
            className="w-10 h-10 rounded border cursor-pointer"
            style={{ backgroundColor: colorValue }}
            onClick={() => setShowPicker(!showPicker)}
          />
          <Input
            value={colorValue}
            readOnly
            onClick={() => setShowPicker(!showPicker)}
            className="cursor-pointer"
          />
        </div>
        {showPicker && (
          <div className="absolute z-10">
            <div className="p-4 rounded-md shadow-lg bg-white">
              <SketchPicker
                color={colorValue}
                onChange={(color) => setTempColor(color)}
              />
              <div className="mt-3 flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowPicker(false);
                    setTempColor(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={handleColorConfirm}
                  size="sm"
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Background Section */}
        <Card>
          <CardHeader>
            <CardTitle>Fondo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Fondo</Label>
              <div className="flex space-x-2">
                <Button 
                  type="button"
                  variant={watchedConfig.background?.type === 'color' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.background) newConfig.background = { type: 'color', value: '#ffffff' };
                    newConfig.background.type = 'color';
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                >
                  Color
                </Button>
                <Button 
                  type="button"
                  variant={watchedConfig.background?.type === 'gradient' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.background) newConfig.background = { type: 'gradient', value: 'linear-gradient(to right, #007bff, #00bcd4)' };
                    newConfig.background.type = 'gradient';
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                >
                  Gradiente
                </Button>
                <Button 
                  type="button"
                  variant={watchedConfig.background?.type === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.background) newConfig.background = { type: 'image', value: 'rgba(255,255,255,0.8)', imageUrl: '' };
                    newConfig.background.type = 'image';
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                >
                  Imagen
                </Button>
              </div>
            </div>
            
            {watchedConfig.background?.type === 'color' && (
              <ColorPicker 
                label="Color de Fondo" 
                path="background.value" 
              />
            )}
            
            {watchedConfig.background?.type === 'gradient' && (
              <div className="space-y-2">
                <Label>Gradiente</Label>
                <Input
                  value={watchedConfig.background?.value || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.background) newConfig.background = { type: 'gradient', value: e.target.value };
                    newConfig.background.value = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="linear-gradient(to right, #007bff, #00bcd4)"
                />
              </div>
            )}
            
            {watchedConfig.background?.type === 'image' && (
              <>
                <ColorPicker 
                  label="Color de Fondo (Debajo de la imagen)" 
                  path="background.value" 
                />
                <div className="space-y-2">
                  <Label>Imagen de Fondo</Label>
                  <div className="mb-2">
                    {watchedConfig.background?.imageUrl && (
                      <div className="h-32 w-full bg-gray-100 rounded-md overflow-hidden relative mb-2">
                        <div 
                          className="absolute inset-0 bg-cover bg-center" 
                          style={{ backgroundImage: `url(${watchedConfig.background.imageUrl})` }}
                        />
                      </div>
                    )}
                  </div>
                  <ImageUploader
                    onChange={(url) => handleImageUpload("background.imageUrl", url)}
                    label="Seleccionar Imagen"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Typography Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tipografía</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fuente de Títulos</Label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={watchedConfig.typography?.heading?.fontFamily || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.typography) newConfig.typography = {};
                    if (!newConfig.typography.heading) newConfig.typography.heading = {};
                    newConfig.typography.heading.fontFamily = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                >
                  <option value="">-- Seleccionar Fuente --</option>
                  {commonFonts.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>{font.split(',')[0]}</option>
                  ))}
                </select>
                
                <Input
                  placeholder="o escribe una fuente personalizada"
                  value={watchedConfig.typography?.heading?.fontFamily || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.typography) newConfig.typography = {};
                    if (!newConfig.typography.heading) newConfig.typography.heading = {};
                    newConfig.typography.heading.fontFamily = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                />
              </div>
              <div className="text-sm mt-1" style={{ fontFamily: watchedConfig.typography?.heading?.fontFamily || 'inherit' }}>
                Vista previa del texto
              </div>
            </div>
            <ColorPicker 
              label="Color de Títulos" 
              path="typography.heading.color" 
            />
            
            <div className="space-y-2">
              <Label>Fuente de Párrafos</Label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={watchedConfig.typography?.paragraph?.fontFamily || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.typography) newConfig.typography = {};
                    if (!newConfig.typography.paragraph) newConfig.typography.paragraph = {};
                    newConfig.typography.paragraph.fontFamily = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                >
                  <option value="">-- Seleccionar Fuente --</option>
                  {commonFonts.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>{font.split(',')[0]}</option>
                  ))}
                </select>
                
                <Input
                  placeholder="o escribe una fuente personalizada"
                  value={watchedConfig.typography?.paragraph?.fontFamily || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.typography) newConfig.typography = {};
                    if (!newConfig.typography.paragraph) newConfig.typography.paragraph = {};
                    newConfig.typography.paragraph.fontFamily = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                />
              </div>
              <div className="text-sm mt-1" style={{ fontFamily: watchedConfig.typography?.paragraph?.fontFamily || 'inherit' }}>
                Vista previa del texto
              </div>
            </div>
            <ColorPicker 
              label="Color de Párrafos" 
              path="typography.paragraph.color" 
            />
            
            <ColorPicker 
              label="Color de Enlaces" 
              path="typography.link.color" 
            />
            
            <ColorPicker 
              label="Color de Enlaces (Hover)" 
              path="typography.link.hoverColor" 
            />
          </CardContent>
        </Card>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Botones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-medium">Botón Primario</h3>
            <ColorPicker 
              label="Color de Fondo" 
              path="buttons.primary.backgroundColor" 
            />
            <ColorPicker 
              label="Color de Texto" 
              path="buttons.primary.textColor" 
            />
            <div className="space-y-2">
              <Label>Radio de Borde</Label>
              <Input
                value={watchedConfig.buttons?.primary?.borderRadius || ''}
                onChange={(e) => {
                  const newConfig = { ...watchedConfig };
                  if (!newConfig.buttons) newConfig.buttons = {};
                  if (!newConfig.buttons.primary) newConfig.buttons.primary = {};
                  newConfig.buttons.primary.borderRadius = e.target.value;
                  setValue('config', newConfig, { shouldValidate: true });
                }}
              />
            </div>

            <h3 className="font-medium mt-4">Botón Secundario</h3>
            <ColorPicker 
              label="Color de Fondo" 
              path="buttons.secondary.backgroundColor" 
            />
            <ColorPicker 
              label="Color de Texto" 
              path="buttons.secondary.textColor" 
            />
          </CardContent>
        </Card>

        {/* Cards Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tarjetas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Radio de Borde</Label>
              <Input
                value={watchedConfig.cards?.borderRadius || ''}
                onChange={(e) => {
                  const newConfig = { ...watchedConfig };
                  if (!newConfig.cards) newConfig.cards = {};
                  newConfig.cards.borderRadius = e.target.value;
                  setValue('config', newConfig, { shouldValidate: true });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Ancho de Borde</Label>
              <Input
                value={watchedConfig.cards?.borderWidth || ''}
                onChange={(e) => {
                  const newConfig = { ...watchedConfig };
                  if (!newConfig.cards) newConfig.cards = {};
                  newConfig.cards.borderWidth = e.target.value;
                  setValue('config', newConfig, { shouldValidate: true });
                }}
              />
            </div>
            <ColorPicker 
              label="Color de Borde" 
              path="cards.borderColor" 
            />
            <h3 className="font-medium mt-4">Configuración de Sombra</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Desplazamiento X</Label>
                <Input
                  value={(watchedConfig.cards?.shadow as any)?.x || '0px'}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.cards) newConfig.cards = {};
                    if (!newConfig.cards.shadow || typeof newConfig.cards.shadow === 'string') {
                      newConfig.cards.shadow = {
                        x: '0px',
                        y: '4px',
                        blur: '6px',
                        spread: '0px',
                        color: 'rgba(0,0,0,0.1)'
                      };
                    }
                    (newConfig.cards.shadow as any).x = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="0px"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Desplazamiento Y</Label>
                <Input
                  value={(watchedConfig.cards?.shadow as any)?.y || '4px'}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.cards) newConfig.cards = {};
                    if (!newConfig.cards.shadow || typeof newConfig.cards.shadow === 'string') {
                      newConfig.cards.shadow = {
                        x: '0px',
                        y: '4px',
                        blur: '6px',
                        spread: '0px',
                        color: 'rgba(0,0,0,0.1)'
                      };
                    }
                    (newConfig.cards.shadow as any).y = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="4px"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Desenfoque</Label>
                <Input
                  value={(watchedConfig.cards?.shadow as any)?.blur || '6px'}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.cards) newConfig.cards = {};
                    if (!newConfig.cards.shadow || typeof newConfig.cards.shadow === 'string') {
                      newConfig.cards.shadow = {
                        x: '0px',
                        y: '4px',
                        blur: '6px',
                        spread: '0px',
                        color: 'rgba(0,0,0,0.1)'
                      };
                    }
                    (newConfig.cards.shadow as any).blur = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="6px"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Expansión</Label>
                <Input
                  value={(watchedConfig.cards?.shadow as any)?.spread || '0px'}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.cards) newConfig.cards = {};
                    if (!newConfig.cards.shadow || typeof newConfig.cards.shadow === 'string') {
                      newConfig.cards.shadow = {
                        x: '0px',
                        y: '4px',
                        blur: '6px',
                        spread: '0px',
                        color: 'rgba(0,0,0,0.1)'
                      };
                    }
                    (newConfig.cards.shadow as any).spread = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="0px"
                />
              </div>
            </div>
            
            <div className="mt-2">
              <ColorPicker 
                label="Color de Sombra" 
                path="cards.shadow.color" 
              />
            </div>
            <ColorPicker 
              label="Color de Fondo" 
              path="cards.background.value" 
            />
          </CardContent>
        </Card>

        {/* Forms Section */}
        <Card>
          <CardHeader>
            <CardTitle>Formularios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-medium">Campos de Entrada</h3>
            
            <ColorPicker 
              label="Color de Fondo" 
              path="forms.input.backgroundColor" 
            />
            
            <ColorPicker 
              label="Color de Texto" 
              path="forms.input.textColor" 
            />
            
            <ColorPicker 
              label="Color de Borde" 
              path="forms.input.borderColor" 
            />
            
            <ColorPicker 
              label="Color de Borde al Enfocar" 
              path="forms.input.focusBorderColor" 
            />
            
            <div className="space-y-2">
              <Label>Radio de Borde</Label>
              <Input
                value={watchedConfig.forms?.input?.borderRadius || ''}
                onChange={(e) => {
                  const newConfig = { ...watchedConfig };
                  if (!newConfig.forms) newConfig.forms = {};
                  if (!newConfig.forms.input) newConfig.forms.input = {};
                  newConfig.forms.input.borderRadius = e.target.value;
                  setValue('config', newConfig, { shouldValidate: true });
                }}
              />
            </div>
            
            <h3 className="font-medium mt-4">Etiquetas</h3>
            
            <ColorPicker 
              label="Color de Texto" 
              path="forms.label.textColor" 
            />
            
            <div className="space-y-2">
              <Label>Peso de Fuente</Label>
              <Input
                value={watchedConfig.forms?.label?.fontWeight || ''}
                onChange={(e) => {
                  const newConfig = { ...watchedConfig };
                  if (!newConfig.forms) newConfig.forms = {};
                  if (!newConfig.forms.label) newConfig.forms.label = {};
                  newConfig.forms.label.fontWeight = e.target.value;
                  setValue('config', newConfig, { shouldValidate: true });
                }}
                placeholder="bold, normal, 500, etc."
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Spacing Section */}
        <Card>
          <CardHeader>
            <CardTitle>Espaciado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-medium">Márgenes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Margen Superior</Label>
                <Input
                  value={watchedConfig.spacing?.margin?.top || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.spacing) newConfig.spacing = {};
                    if (!newConfig.spacing.margin) newConfig.spacing.margin = {};
                    newConfig.spacing.margin.top = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="1rem, 16px, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Margen Derecho</Label>
                <Input
                  value={watchedConfig.spacing?.margin?.right || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.spacing) newConfig.spacing = {};
                    if (!newConfig.spacing.margin) newConfig.spacing.margin = {};
                    newConfig.spacing.margin.right = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="1rem, 16px, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Margen Inferior</Label>
                <Input
                  value={watchedConfig.spacing?.margin?.bottom || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.spacing) newConfig.spacing = {};
                    if (!newConfig.spacing.margin) newConfig.spacing.margin = {};
                    newConfig.spacing.margin.bottom = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="1rem, 16px, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Margen Izquierdo</Label>
                <Input
                  value={watchedConfig.spacing?.margin?.left || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.spacing) newConfig.spacing = {};
                    if (!newConfig.spacing.margin) newConfig.spacing.margin = {};
                    newConfig.spacing.margin.left = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="1rem, 16px, etc."
                />
              </div>
            </div>
            
            <h3 className="font-medium mt-6">Padding</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Padding Superior</Label>
                <Input
                  value={watchedConfig.spacing?.padding?.top || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.spacing) newConfig.spacing = {};
                    if (!newConfig.spacing.padding) newConfig.spacing.padding = {};
                    newConfig.spacing.padding.top = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="1rem, 16px, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Padding Derecho</Label>
                <Input
                  value={watchedConfig.spacing?.padding?.right || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.spacing) newConfig.spacing = {};
                    if (!newConfig.spacing.padding) newConfig.spacing.padding = {};
                    newConfig.spacing.padding.right = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="1rem, 16px, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Padding Inferior</Label>
                <Input
                  value={watchedConfig.spacing?.padding?.bottom || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.spacing) newConfig.spacing = {};
                    if (!newConfig.spacing.padding) newConfig.spacing.padding = {};
                    newConfig.spacing.padding.bottom = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="1rem, 16px, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Padding Izquierdo</Label>
                <Input
                  value={watchedConfig.spacing?.padding?.left || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.spacing) newConfig.spacing = {};
                    if (!newConfig.spacing.padding) newConfig.spacing.padding = {};
                    newConfig.spacing.padding.left = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="1rem, 16px, etc."
                />
              </div>
            </div>
            
            
          </CardContent>
        </Card>
        
        {/* Effects Section */}
        <Card>
          <CardHeader>
            <CardTitle>Efectos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="transitions">Transiciones</Label>
              <Switch
                id="transitions"
                checked={watchedConfig.effects?.transitions || false}
                onCheckedChange={(checked) => {
                  const newConfig = { ...watchedConfig };
                  if (!newConfig.effects) newConfig.effects = {};
                  newConfig.effects.transitions = checked;
                  setValue('config', newConfig, { shouldValidate: true });
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Animaciones</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={(watchedConfig.effects?.animation as any) || 'none'}
                onChange={(e) => {
                  const newConfig = { ...watchedConfig };
                  if (!newConfig.effects) newConfig.effects = {};
                  (newConfig.effects as any).animation = e.target.value;
                  setValue('config', newConfig, { shouldValidate: true });
                }}
              >
                <option value="none">Ninguna</option>
                <option value="zoomin">Zoom In</option>
                <option value="zoomout">Zoom Out</option>
                <option value="scale">Escalar</option>
                <option value="glow">Brillo</option>
                <option value="bounce">Rebotar</option>
                <option value="pulse">Pulsar</option>
                <option value="shake">Agitar</option>
                <option value="slide">Deslizar</option>
                <option value="custom">Personalizada</option>
              </select>
            </div>
            
            {watchedConfig.effects?.animation === 'custom' && (
              <div className="space-y-2 mt-4">
                <Label>Animación Personalizada</Label>
                <Input
                  value={watchedConfig.effects?.customAnimation || ''}
                  onChange={(e) => {
                    const newConfig = { ...watchedConfig };
                    if (!newConfig.effects) newConfig.effects = {};
                    newConfig.effects.customAnimation = e.target.value;
                    setValue('config', newConfig, { shouldValidate: true });
                  }}
                  placeholder="keyframes..."
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="outline" 
          className="mr-2"
          onClick={() => router.push('/admin/theme')}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isEditing ? 'Guardar Cambios' : 'Crear Tema'}
        </Button>
      </div>
    </form>
  );
}
