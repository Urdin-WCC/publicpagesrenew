'use client';

import { ThemeConfig } from '@/types/theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/core/ImageUploader';
import { ColorPicker } from './ColorPicker';

interface BackgroundSectionProps {
  config: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
}

export function BackgroundSection({ config, onChange }: BackgroundSectionProps) {
  // Helper to update a specific path in the config
  const updateConfigValue = (path: string, value: any) => {
    const pathArray = path.split('.');
    const newConfig = { ...config };
    
    // Navigate to the right nested property
    let current: any = newConfig;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    // Set the value
    current[pathArray[pathArray.length - 1]] = value;
    
    // Update the form
    onChange(newConfig);
  };

  // Function to get a nested value from the config with proper typing
  const getConfigValue = (path: string, defaultValue: any = ''): any => {
    const result = path.split('.').reduce((prev: any, curr: string) => {
      return prev && typeof prev === 'object' ? prev[curr] : undefined;
    }, config as any);
    
    return result !== undefined ? result : defaultValue;
  };

  // Set background type
  const handleBackgroundTypeChange = (type: 'color' | 'gradient' | 'image') => {
    const newConfig = { ...config };
    if (!newConfig.background) {
      newConfig.background = { type, value: type === 'color' ? '#ffffff' : type === 'gradient' ? 'linear-gradient(to right, rgba(0,123,255,1), rgba(0,188,212,1))' : 'rgba(255,255,255,0.8)' };
      
      if (type === 'image') {
        newConfig.background.imageUrl = '';
      }
    } else {
      newConfig.background.type = type;
      if (type === 'gradient' && !newConfig.background.value.startsWith('linear-gradient') && !newConfig.background.value.startsWith('radial-gradient')) {
        newConfig.background.value = 'linear-gradient(to right, rgba(0,123,255,1), rgba(0,188,212,1))';
      } else if (type === 'color' && (newConfig.background.value.startsWith('linear-gradient') || newConfig.background.value.startsWith('radial-gradient'))) {
        newConfig.background.value = '#ffffff';
      }
    }
    
    onChange(newConfig);
  };

  // Handle image upload
  const handleImageUpload = (url: string) => {
    updateConfigValue('background.imageUrl', url);
  };

  // Current background type
  const backgroundType = getConfigValue('background.type', 'color');

  return (
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
              variant={backgroundType === 'color' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleBackgroundTypeChange('color')}
            >
              Color
            </Button>
            <Button 
              type="button"
              variant={backgroundType === 'gradient' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleBackgroundTypeChange('gradient')}
            >
              Degradado
            </Button>
            <Button 
              type="button"
              variant={backgroundType === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleBackgroundTypeChange('image')}
            >
              Imagen
            </Button>
          </div>
        </div>
        
        {backgroundType === 'color' && (
          <ColorPicker 
            label="Color de Fondo" 
            value={getConfigValue('background.value', '#ffffff')} 
            onChange={(value) => updateConfigValue('background.value', value)}
            showAlpha={true}
          />
        )}
        
        {backgroundType === 'gradient' && (
          <ColorPicker 
            label="Degradado" 
            value={getConfigValue('background.value', 'linear-gradient(to right, rgba(0,123,255,1), rgba(0,188,212,1))')} 
            onChange={(value) => updateConfigValue('background.value', value)}
            supportGradient={true}
            showAlpha={true}
          />
        )}
        
        {backgroundType === 'image' && (
          <>
            <ColorPicker 
              label="Color de Fondo (Debajo de la imagen)" 
              value={getConfigValue('background.value', 'rgba(255,255,255,1)')} 
              onChange={(value) => updateConfigValue('background.value', value)}
              showAlpha={true}
            />
            <div className="space-y-2">
              <Label>Imagen de Fondo</Label>
              <div className="mb-2">
                {getConfigValue('background.imageUrl', '') && (
                  <div className="h-32 w-full bg-gray-100 rounded-md overflow-hidden relative mb-2">
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{ backgroundImage: `url(${getConfigValue('background.imageUrl', '')})` }}
                    />
                  </div>
                )}
              </div>
              <ImageUploader
                onChange={handleImageUpload}
                label="Seleccionar Imagen"
              />
            </div>
            
            {/* Preview */}
            <div className="mt-4 border p-4 rounded-md">
              <h3 className="font-medium text-sm mb-2">Vista Previa:</h3>
              <div 
                className="h-32 w-full rounded-md overflow-hidden relative"
                style={{ 
                  backgroundColor: getConfigValue('background.value', 'rgba(255,255,255,1)'),
                  backgroundImage: getConfigValue('background.imageUrl', '') 
                    ? `url(${getConfigValue('background.imageUrl', '')})` 
                    : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
