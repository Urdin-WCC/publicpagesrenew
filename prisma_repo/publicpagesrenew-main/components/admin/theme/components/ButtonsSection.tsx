'use client';

import { useState } from 'react';
import { ThemeConfig } from '@/types/theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from './ColorPicker';

interface ButtonsSectionProps {
  config: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
}

export function ButtonsSection({ config, onChange }: ButtonsSectionProps) {
  // Default value for the tab
  const [activeTab, setActiveTab] = useState<string>('primary');

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Botones</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="primary" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="primary">Botón Primario</TabsTrigger>
            <TabsTrigger value="secondary">Botón Secundario</TabsTrigger>
          </TabsList>
          
          <TabsContent value="primary" className="mt-4 space-y-4">
            <ColorPicker 
              label="Color de Fondo" 
              value={getConfigValue('buttons.primary.backgroundColor', '#007bff')}
              onChange={(value) => updateConfigValue('buttons.primary.backgroundColor', value)}
              showAlpha={true}
            />
            
            <ColorPicker 
              label="Color de Texto" 
              value={getConfigValue('buttons.primary.textColor', '#ffffff')}
              onChange={(value) => updateConfigValue('buttons.primary.textColor', value)}
              showAlpha={true}
            />
            
            <div className="space-y-2">
              <Label>Radio de Borde</Label>
              <Input
                placeholder="ej: 0.25rem, 4px"
                value={getConfigValue('buttons.primary.borderRadius', '0.25rem')}
                onChange={(e) => updateConfigValue('buttons.primary.borderRadius', e.target.value)}
              />
            </div>
            
            <ColorPicker 
              label="Color de Fondo (Hover)" 
              value={getConfigValue('buttons.primary.hoverBackgroundColor', '#0069d9')}
              onChange={(value) => updateConfigValue('buttons.primary.hoverBackgroundColor', value)}
              showAlpha={true}
            />
            
            <ColorPicker 
              label="Color de Texto (Hover)" 
              value={getConfigValue('buttons.primary.hoverTextColor', '#ffffff')}
              onChange={(value) => updateConfigValue('buttons.primary.hoverTextColor', value)}
              showAlpha={true}
            />
            
            {/* Live Preview */}
            <div className="mt-4 border p-4 rounded-md">
              <h3 className="font-medium text-sm mb-2">Vista Previa:</h3>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <button 
                  className="px-4 py-2 text-center"
                  style={{
                    backgroundColor: getConfigValue('buttons.primary.backgroundColor', '#007bff'),
                    color: getConfigValue('buttons.primary.textColor', '#ffffff'),
                    borderRadius: getConfigValue('buttons.primary.borderRadius', '0.25rem'),
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Botón Normal
                </button>
                <button 
                  className="px-4 py-2 text-center"
                  style={{
                    backgroundColor: getConfigValue('buttons.primary.hoverBackgroundColor', '#0069d9'),
                    color: getConfigValue('buttons.primary.hoverTextColor', '#ffffff'),
                    borderRadius: getConfigValue('buttons.primary.borderRadius', '0.25rem'),
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Botón Hover
                </button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="secondary" className="mt-4 space-y-4">
            <ColorPicker 
              label="Color de Fondo" 
              value={getConfigValue('buttons.secondary.backgroundColor', '#6c757d')}
              onChange={(value) => updateConfigValue('buttons.secondary.backgroundColor', value)}
              showAlpha={true}
            />
            
            <ColorPicker 
              label="Color de Texto" 
              value={getConfigValue('buttons.secondary.textColor', '#ffffff')}
              onChange={(value) => updateConfigValue('buttons.secondary.textColor', value)}
              showAlpha={true}
            />
            
            <div className="space-y-2">
              <Label>Radio de Borde</Label>
              <Input
                placeholder="ej: 0.25rem, 4px"
                value={getConfigValue('buttons.secondary.borderRadius', '0.25rem')}
                onChange={(e) => updateConfigValue('buttons.secondary.borderRadius', e.target.value)}
              />
            </div>
            
            <ColorPicker 
              label="Color de Fondo (Hover)" 
              value={getConfigValue('buttons.secondary.hoverBackgroundColor', '#5a6268')}
              onChange={(value) => updateConfigValue('buttons.secondary.hoverBackgroundColor', value)}
              showAlpha={true}
            />
            
            <ColorPicker 
              label="Color de Texto (Hover)" 
              value={getConfigValue('buttons.secondary.hoverTextColor', '#ffffff')}
              onChange={(value) => updateConfigValue('buttons.secondary.hoverTextColor', value)}
              showAlpha={true}
            />
            
            {/* Live Preview */}
            <div className="mt-4 border p-4 rounded-md">
              <h3 className="font-medium text-sm mb-2">Vista Previa:</h3>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <button 
                  className="px-4 py-2 text-center"
                  style={{
                    backgroundColor: getConfigValue('buttons.secondary.backgroundColor', '#6c757d'),
                    color: getConfigValue('buttons.secondary.textColor', '#ffffff'),
                    borderRadius: getConfigValue('buttons.secondary.borderRadius', '0.25rem'),
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Botón Normal
                </button>
                <button 
                  className="px-4 py-2 text-center"
                  style={{
                    backgroundColor: getConfigValue('buttons.secondary.hoverBackgroundColor', '#5a6268'),
                    color: getConfigValue('buttons.secondary.hoverTextColor', '#ffffff'),
                    borderRadius: getConfigValue('buttons.secondary.borderRadius', '0.25rem'),
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Botón Hover
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
