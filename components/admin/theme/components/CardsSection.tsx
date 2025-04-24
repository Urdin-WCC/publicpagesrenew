'use client';

import { ThemeConfig } from '@/types/theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/core/ImageUploader';
import { ColorPicker } from './ColorPicker';

interface CardsSectionProps {
  config: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
}

export function CardsSection({ config, onChange }: CardsSectionProps) {
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

  // Set background type for card
  const handleCardBackgroundTypeChange = (type: 'color' | 'gradient' | 'image') => {
    const newConfig = { ...config };
    if (!newConfig.cards) newConfig.cards = {};
    if (!newConfig.cards.background) {
      newConfig.cards.background = { 
        type, 
        value: type === 'color' ? '#ffffff' : 
               type === 'gradient' ? 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(240,240,240,1))' : 
               'rgba(255,255,255,1)' 
      };
      
      if (type === 'image') {
        newConfig.cards.background.imageUrl = '';
      }
    } else {
      newConfig.cards.background.type = type;
      
      // Set appropriate default values when switching types
      if (type === 'gradient' && !newConfig.cards.background.value.startsWith('linear-gradient') && !newConfig.cards.background.value.startsWith('radial-gradient')) {
        newConfig.cards.background.value = 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(240,240,240,1))';
      } else if (type === 'color' && (newConfig.cards.background.value.startsWith('linear-gradient') || newConfig.cards.background.value.startsWith('radial-gradient'))) {
        newConfig.cards.background.value = '#ffffff';
      }
    }
    
    onChange(newConfig);
  };

  // Handle card background image upload
  const handleCardImageUpload = (url: string) => {
    updateConfigValue('cards.background.imageUrl', url);
  };

  // Current background type for card
  const cardBackgroundType = getConfigValue('cards.background.type', 'color');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarjetas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Radio de Borde</Label>
            <Input
              placeholder="ej: 0.5rem, 8px"
              value={getConfigValue('cards.borderRadius', '0.5rem')}
              onChange={(e) => updateConfigValue('cards.borderRadius', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Ancho de Borde</Label>
            <Input
              placeholder="ej: 1px, 2px, border, border-2"
              value={getConfigValue('cards.borderWidth', '1px')}
              onChange={(e) => updateConfigValue('cards.borderWidth', e.target.value)}
            />
          </div>
        </div>

        <ColorPicker 
          label="Color de Borde" 
          value={getConfigValue('cards.borderColor', 'rgba(0,0,0,0.1)')}
          onChange={(value) => updateConfigValue('cards.borderColor', value)}
          showAlpha={true}
        />
        
        <div className="space-y-2">
          <Label>Tipo de Fondo</Label>
          <div className="flex space-x-2">
            <Button 
              type="button"
              variant={cardBackgroundType === 'color' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCardBackgroundTypeChange('color')}
            >
              Color
            </Button>
            <Button 
              type="button"
              variant={cardBackgroundType === 'gradient' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCardBackgroundTypeChange('gradient')}
            >
              Degradado
            </Button>
            <Button 
              type="button"
              variant={cardBackgroundType === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCardBackgroundTypeChange('image')}
            >
              Imagen
            </Button>
          </div>
        </div>
        
        {cardBackgroundType === 'color' && (
          <ColorPicker 
            label="Color de Fondo" 
            value={getConfigValue('cards.background.value', '#ffffff')}
            onChange={(value) => updateConfigValue('cards.background.value', value)}
            showAlpha={true}
          />
        )}
        
        {cardBackgroundType === 'gradient' && (
          <ColorPicker 
            label="Degradado" 
            value={getConfigValue('cards.background.value', 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(240,240,240,1))')}
            onChange={(value) => updateConfigValue('cards.background.value', value)}
            supportGradient={true}
            showAlpha={true}
          />
        )}
        
        {cardBackgroundType === 'image' && (
          <>
            <ColorPicker 
              label="Color de Fondo (Debajo de la imagen)" 
              value={getConfigValue('cards.background.value', 'rgba(255,255,255,1)')}
              onChange={(value) => updateConfigValue('cards.background.value', value)}
              showAlpha={true}
            />
            <div className="space-y-2">
              <Label>Imagen de Fondo</Label>
              <div className="mb-2">
                {getConfigValue('cards.background.imageUrl', '') && (
                  <div className="h-32 w-full bg-gray-100 rounded-md overflow-hidden relative mb-2">
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{ backgroundImage: `url(${getConfigValue('cards.background.imageUrl', '')})` }}
                    />
                  </div>
                )}
              </div>
              <ImageUploader
                onChange={handleCardImageUpload}
                label="Seleccionar Imagen"
              />
            </div>
          </>
        )}
        
        <h3 className="font-medium border-t pt-4 mt-4">Configuración de Sombra</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Desplazamiento X</Label>
            <Input
              placeholder="ej: 0px"
              value={getConfigValue('cards.shadow.x', '0px')}
              onChange={(e) => updateConfigValue('cards.shadow.x', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Desplazamiento Y</Label>
            <Input
              placeholder="ej: 4px"
              value={getConfigValue('cards.shadow.y', '4px')}
              onChange={(e) => updateConfigValue('cards.shadow.y', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Desenfoque</Label>
            <Input
              placeholder="ej: 6px"
              value={getConfigValue('cards.shadow.blur', '6px')}
              onChange={(e) => updateConfigValue('cards.shadow.blur', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Expansión</Label>
            <Input
              placeholder="ej: 0px"
              value={getConfigValue('cards.shadow.spread', '0px')}
              onChange={(e) => updateConfigValue('cards.shadow.spread', e.target.value)}
            />
          </div>
        </div>
        
        <ColorPicker 
          label="Color de Sombra" 
          value={getConfigValue('cards.shadow.color', 'rgba(0,0,0,0.1)')}
          onChange={(value) => updateConfigValue('cards.shadow.color', value)}
          showAlpha={true}
        />
        
        {/* Live Preview */}
        <div className="mt-6 border p-4 rounded-md">
          <h3 className="font-medium text-sm mb-4">Vista Previa:</h3>
          <div 
            className="mx-auto p-4 max-w-md"
            style={{
              borderRadius: getConfigValue('cards.borderRadius', '0.5rem'),
              borderWidth: getConfigValue('cards.borderWidth', '1px'),
              borderStyle: 'solid',
              borderColor: getConfigValue('cards.borderColor', 'rgba(0,0,0,0.1)'),
              backgroundColor: cardBackgroundType === 'color' ? getConfigValue('cards.background.value', '#ffffff') : undefined,
              backgroundImage: 
                cardBackgroundType === 'gradient' ? getConfigValue('cards.background.value', 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(240,240,240,1))') : 
                cardBackgroundType === 'image' ? 
                  `url(${getConfigValue('cards.background.imageUrl', '')})` : 
                  undefined,
              backgroundSize: cardBackgroundType === 'image' ? 'cover' : undefined,
              backgroundPosition: cardBackgroundType === 'image' ? 'center' : undefined,
              boxShadow: `${getConfigValue('cards.shadow.x', '0px')} ${getConfigValue('cards.shadow.y', '4px')} ${getConfigValue('cards.shadow.blur', '6px')} ${getConfigValue('cards.shadow.spread', '0px')} ${getConfigValue('cards.shadow.color', 'rgba(0,0,0,0.1)')}`
            }}
          >
            <h3 className="text-lg font-bold mb-2">Título de Ejemplo</h3>
            <p className="text-sm mb-3">Este es un contenido de ejemplo para mostrar cómo se verán las tarjetas con la configuración aplicada. Incluye texto y otros elementos para una vista previa realista.</p>
            <button className="text-white bg-blue-500 px-3 py-1 rounded text-sm">Botón de Ejemplo</button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
