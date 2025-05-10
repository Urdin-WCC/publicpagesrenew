'use client';

import { useState } from 'react';
import { ThemeConfig } from '@/types/theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FontSelector } from './FontSelector';
import { ColorPicker } from './ColorPicker';

interface TypographySectionProps {
  config: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
}

export function TypographySection({ config, onChange }: TypographySectionProps) {
  // Default value for the tab
  const [activeTab, setActiveTab] = useState<string>('heading');

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

  // Preview templates for each typography type
  const previewTemplates = {
    heading: 'Título de Ejemplo',
    paragraph: 'Este es un párrafo de ejemplo para mostrar cómo se verá el texto con la fuente, tamaño y estilos seleccionados.',
    link: 'Enlace de ejemplo'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipografía</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="heading" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="heading">Títulos</TabsTrigger>
            <TabsTrigger value="paragraph">Párrafos</TabsTrigger>
            <TabsTrigger value="link">Enlaces</TabsTrigger>
          </TabsList>
          
          <TabsContent value="heading" className="mt-4 space-y-4">
            <FontSelector 
              label="Fuente" 
              value={getConfigValue('typography.heading.fontFamily', 'Arial, sans-serif')} 
              onChange={(value) => updateConfigValue('typography.heading.fontFamily', value)}
              previewText={previewTemplates.heading}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tamaño de Texto</Label>
                <Input
                  placeholder="ej: 1.5rem, 24px"
                  value={getConfigValue('typography.heading.fontSize', '')}
                  onChange={(e) => updateConfigValue('typography.heading.fontSize', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Grosor</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={getConfigValue('typography.heading.fontWeight', '')}
                  onChange={(e) => updateConfigValue('typography.heading.fontWeight', e.target.value)}
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
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estilo</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={getConfigValue('typography.heading.fontStyle', 'normal')}
                  onChange={(e) => updateConfigValue('typography.heading.fontStyle', e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Cursiva</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Transformación</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={getConfigValue('typography.heading.textTransform', 'none')}
                  onChange={(e) => updateConfigValue('typography.heading.textTransform', e.target.value)}
                >
                  <option value="none">Ninguna</option>
                  <option value="uppercase">MAYÚSCULAS</option>
                  <option value="lowercase">minúsculas</option>
                  <option value="capitalize">Capitalizado</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Decoración</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={getConfigValue('typography.heading.textDecoration', 'none')}
                onChange={(e) => updateConfigValue('typography.heading.textDecoration', e.target.value)}
              >
                <option value="none">Ninguna</option>
                <option value="underline">Subrayado</option>
                <option value="line-through">Tachado</option>
                <option value="overline">Sobrelínea</option>
              </select>
            </div>
            
            <ColorPicker 
              label="Color" 
              value={getConfigValue('typography.heading.color', '#333333')}
              onChange={(value) => updateConfigValue('typography.heading.color', value)}
              showAlpha={true}
            />
            
            {/* Live Preview */}
            <div className="mt-4 border p-4 rounded-md">
              <h3 className="font-medium text-sm mb-2">Vista Previa:</h3>
              <div 
                style={{
                  fontFamily: getConfigValue('typography.heading.fontFamily', 'Arial, sans-serif'),
                  fontSize: getConfigValue('typography.heading.fontSize', ''),
                  fontWeight: getConfigValue('typography.heading.fontWeight', ''),
                  fontStyle: getConfigValue('typography.heading.fontStyle', 'normal'),
                  textTransform: getConfigValue('typography.heading.textTransform', 'none'),
                  textDecoration: getConfigValue('typography.heading.textDecoration', 'none'),
                  color: getConfigValue('typography.heading.color', '#333333')
                }}
              >
                {previewTemplates.heading}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="paragraph" className="mt-4 space-y-4">
            <FontSelector 
              label="Fuente" 
              value={getConfigValue('typography.paragraph.fontFamily', 'Arial, sans-serif')} 
              onChange={(value) => updateConfigValue('typography.paragraph.fontFamily', value)}
              previewText={previewTemplates.paragraph}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tamaño de Texto</Label>
                <Input
                  placeholder="ej: 1rem, 16px"
                  value={getConfigValue('typography.paragraph.fontSize', '')}
                  onChange={(e) => updateConfigValue('typography.paragraph.fontSize', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Grosor</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={getConfigValue('typography.paragraph.fontWeight', '')}
                  onChange={(e) => updateConfigValue('typography.paragraph.fontWeight', e.target.value)}
                >
                  <option value="">Normal</option>
                  <option value="300">Ligero (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="500">Medio (500)</option>
                  <option value="600">Semi-Negrita (600)</option>
                  <option value="700">Negrita (700)</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estilo</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={getConfigValue('typography.paragraph.fontStyle', 'normal')}
                  onChange={(e) => updateConfigValue('typography.paragraph.fontStyle', e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Cursiva</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Decoración</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={getConfigValue('typography.paragraph.textDecoration', 'none')}
                  onChange={(e) => updateConfigValue('typography.paragraph.textDecoration', e.target.value)}
                >
                  <option value="none">Ninguna</option>
                  <option value="underline">Subrayado</option>
                  <option value="line-through">Tachado</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Altura de Línea</Label>
              <Input
                placeholder="ej: 1.5, 24px"
                value={getConfigValue('typography.paragraph.lineHeight', '')}
                onChange={(e) => updateConfigValue('typography.paragraph.lineHeight', e.target.value)}
              />
            </div>
            
            <ColorPicker 
              label="Color" 
              value={getConfigValue('typography.paragraph.color', '#666666')}
              onChange={(value) => updateConfigValue('typography.paragraph.color', value)}
              showAlpha={true}
            />
            
            {/* Live Preview */}
            <div className="mt-4 border p-4 rounded-md">
              <h3 className="font-medium text-sm mb-2">Vista Previa:</h3>
              <p 
                style={{
                  fontFamily: getConfigValue('typography.paragraph.fontFamily', 'Arial, sans-serif'),
                  fontSize: getConfigValue('typography.paragraph.fontSize', ''),
                  fontWeight: getConfigValue('typography.paragraph.fontWeight', ''),
                  fontStyle: getConfigValue('typography.paragraph.fontStyle', 'normal'),
                  textDecoration: getConfigValue('typography.paragraph.textDecoration', 'none'),
                  lineHeight: getConfigValue('typography.paragraph.lineHeight', ''),
                  color: getConfigValue('typography.paragraph.color', '#666666')
                }}
              >
                {previewTemplates.paragraph}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="link" className="mt-4 space-y-4">
            <FontSelector 
              label="Fuente" 
              value={getConfigValue('typography.link.fontFamily', 'Arial, sans-serif')} 
              onChange={(value) => updateConfigValue('typography.link.fontFamily', value)}
              previewText={previewTemplates.link}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tamaño de Texto</Label>
                <Input
                  placeholder="ej: 1rem, 16px"
                  value={getConfigValue('typography.link.fontSize', '')}
                  onChange={(e) => updateConfigValue('typography.link.fontSize', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Grosor</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={getConfigValue('typography.link.fontWeight', '')}
                  onChange={(e) => updateConfigValue('typography.link.fontWeight', e.target.value)}
                >
                  <option value="">Normal</option>
                  <option value="300">Ligero (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="500">Medio (500)</option>
                  <option value="600">Semi-Negrita (600)</option>
                  <option value="700">Negrita (700)</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estilo</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={getConfigValue('typography.link.fontStyle', 'normal')}
                  onChange={(e) => updateConfigValue('typography.link.fontStyle', e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Cursiva</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Decoración</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={getConfigValue('typography.link.textDecoration', 'none')}
                  onChange={(e) => updateConfigValue('typography.link.textDecoration', e.target.value)}
                >
                  <option value="none">Ninguna</option>
                  <option value="underline">Subrayado</option>
                  <option value="line-through">Tachado</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Decoración al Hover</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={getConfigValue('typography.link.hoverTextDecoration', 'underline')}
                onChange={(e) => updateConfigValue('typography.link.hoverTextDecoration', e.target.value)}
              >
                <option value="none">Ninguna</option>
                <option value="underline">Subrayado</option>
                <option value="line-through">Tachado</option>
              </select>
            </div>
            
            <ColorPicker 
              label="Color" 
              value={getConfigValue('typography.link.color', '#007bff')}
              onChange={(value) => updateConfigValue('typography.link.color', value)}
              showAlpha={true}
            />
            
            <ColorPicker 
              label="Color Hover" 
              value={getConfigValue('typography.link.hoverColor', '#0056b3')}
              onChange={(value) => updateConfigValue('typography.link.hoverColor', value)}
              showAlpha={true}
            />
            
            {/* Live Preview */}
            <div className="mt-4 border p-4 rounded-md">
              <h3 className="font-medium text-sm mb-2">Vista Previa:</h3>
              <a 
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  fontFamily: getConfigValue('typography.link.fontFamily', 'Arial, sans-serif') as string,
                  fontSize: getConfigValue('typography.link.fontSize', '') as string,
                  fontWeight: getConfigValue('typography.link.fontWeight', '') as string,
                  fontStyle: getConfigValue('typography.link.fontStyle', 'normal') as string,
                  textDecoration: getConfigValue('typography.link.textDecoration', 'none') as string,
                  color: getConfigValue('typography.link.color', '#007bff') as string
                }}
                className="hover-preview-link"
              >
                {previewTemplates.link}
              </a>
              <style jsx>{`
                .hover-preview-link:hover {
                  color: ${getConfigValue('typography.link.hoverColor', '#0056b3') as string} !important;
                  text-decoration: ${getConfigValue('typography.link.hoverTextDecoration', 'underline') as string} !important;
                }
              `}</style>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
