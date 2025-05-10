'use client';

import { ThemeConfig } from '@/types/theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from './ColorPicker';

interface FormsSectionProps {
  config: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
}

export function FormsSection({ config, onChange }: FormsSectionProps) {
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
        <CardTitle>Formularios</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="input">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="input">Campos de Entrada</TabsTrigger>
            <TabsTrigger value="label">Etiquetas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="mt-4 space-y-4">
            <ColorPicker 
              label="Color de Fondo" 
              value={getConfigValue('forms.input.backgroundColor', '#ffffff')}
              onChange={(value) => updateConfigValue('forms.input.backgroundColor', value)}
              showAlpha={true}
            />
            
            <ColorPicker 
              label="Color de Texto" 
              value={getConfigValue('forms.input.textColor', '#495057')}
              onChange={(value) => updateConfigValue('forms.input.textColor', value)}
              showAlpha={true}
            />
            
            <ColorPicker 
              label="Color de Borde" 
              value={getConfigValue('forms.input.borderColor', '#ced4da')}
              onChange={(value) => updateConfigValue('forms.input.borderColor', value)}
              showAlpha={true}
            />
            
            <div className="space-y-2">
              <Label>Radio de Borde</Label>
              <Input
                placeholder="ej: 0.25rem, 4px"
                value={getConfigValue('forms.input.borderRadius', '0.25rem')}
                onChange={(e) => updateConfigValue('forms.input.borderRadius', e.target.value)}
              />
            </div>
            
            <ColorPicker 
              label="Color de Borde al Enfocar" 
              value={getConfigValue('forms.input.focusBorderColor', '#80bdff')}
              onChange={(value) => updateConfigValue('forms.input.focusBorderColor', value)}
              showAlpha={true}
            />
            
            {/* Live Preview */}
            <div className="mt-6 border p-4 rounded-md">
              <h3 className="font-medium text-sm mb-4">Vista Previa:</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label 
                    className="block mb-1"
                    style={{
                      color: getConfigValue('forms.label.textColor', '#212529'),
                      fontWeight: getConfigValue('forms.label.fontWeight', 'bold')
                    }}
                  >
                    Campo de Ejemplo
                  </label>
                  <input
                    type="text"
                    placeholder="Texto de ejemplo"
                    className="w-full p-2 block focus-visible:outline-none"
                    style={{
                      backgroundColor: getConfigValue('forms.input.backgroundColor', '#ffffff'),
                      color: getConfigValue('forms.input.textColor', '#495057'),
                      borderColor: getConfigValue('forms.input.borderColor', '#ced4da'),
                      borderRadius: getConfigValue('forms.input.borderRadius', '0.25rem'),
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label 
                    className="block mb-1"
                    style={{
                      color: getConfigValue('forms.label.textColor', '#212529'),
                      fontWeight: getConfigValue('forms.label.fontWeight', 'bold')
                    }}
                  >
                    Campo con Foco
                  </label>
                  <div
                    className="w-full p-2 block"
                    style={{
                      backgroundColor: getConfigValue('forms.input.backgroundColor', '#ffffff'),
                      color: getConfigValue('forms.input.textColor', '#495057'),
                      borderColor: getConfigValue('forms.input.focusBorderColor', '#80bdff'),
                      borderRadius: getConfigValue('forms.input.borderRadius', '0.25rem'),
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      boxShadow: `0 0 0 3px ${getConfigValue('forms.input.focusBorderColor', '#80bdff')}33`
                    }}
                  >
                    Texto de ejemplo con foco
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="label" className="mt-4 space-y-4">
            <ColorPicker 
              label="Color de Texto" 
              value={getConfigValue('forms.label.textColor', '#212529')}
              onChange={(value) => updateConfigValue('forms.label.textColor', value)}
              showAlpha={true}
            />
            
            <div className="space-y-2">
              <Label>Peso de Fuente</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={getConfigValue('forms.label.fontWeight', 'bold')}
                onChange={(e) => updateConfigValue('forms.label.fontWeight', e.target.value)}
              >
                <option value="normal">Normal</option>
                <option value="300">Ligero (300)</option>
                <option value="400">Regular (400)</option>
                <option value="500">Medio (500)</option>
                <option value="600">Semi-Negrita (600)</option>
                <option value="700">Negrita (700)</option>
                <option value="bold">Negrita (bold)</option>
              </select>
            </div>
            
            {/* Live Preview */}
            <div className="mt-6 border p-4 rounded-md">
              <h3 className="font-medium text-sm mb-4">Vista Previa:</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label 
                    className="block mb-1"
                    style={{
                      color: getConfigValue('forms.label.textColor', '#212529'),
                      fontWeight: getConfigValue('forms.label.fontWeight', 'bold')
                    }}
                  >
                    Etiqueta de Ejemplo
                  </label>
                  <input
                    type="text"
                    placeholder="Campo con etiqueta configurada"
                    className="w-full p-2 block border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label 
                    className="block mb-1"
                    style={{
                      color: getConfigValue('forms.label.textColor', '#212529'),
                      fontWeight: getConfigValue('forms.label.fontWeight', 'bold')
                    }}
                  >
                    Otra Etiqueta de Ejemplo
                  </label>
                  <select className="w-full p-2 block border rounded">
                    <option>Opción 1</option>
                    <option>Opción 2</option>
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
