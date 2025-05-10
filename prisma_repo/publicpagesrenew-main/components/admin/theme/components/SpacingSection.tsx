'use client';

import { ThemeConfig } from '@/types/theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SpacingSectionProps {
  config: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
}

export function SpacingSection({ config, onChange }: SpacingSectionProps) {
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
        <CardTitle>Espaciado</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="margin">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="margin">Márgenes</TabsTrigger>
            <TabsTrigger value="padding">Padding</TabsTrigger>
          </TabsList>
          
          <TabsContent value="margin" className="mt-4">
            <div className="space-y-2 mb-4">
              <Label>Valor General (base)</Label>
              <Input
                placeholder="ej: 1rem, 16px"
                value={getConfigValue('spacing.margin.base', '1rem')}
                onChange={(e) => updateConfigValue('spacing.margin.base', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Este valor se usará como base general para los márgenes si los valores específicos no están definidos.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="space-y-2">
                <Label>Margen Superior</Label>
                <Input
                  placeholder="ej: 1rem, 16px"
                  value={getConfigValue('spacing.margin.top', '1rem')}
                  onChange={(e) => updateConfigValue('spacing.margin.top', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Margen Derecho</Label>
                <Input
                  placeholder="ej: 1rem, 16px"
                  value={getConfigValue('spacing.margin.right', '1rem')}
                  onChange={(e) => updateConfigValue('spacing.margin.right', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Margen Inferior</Label>
                <Input
                  placeholder="ej: 1rem, 16px"
                  value={getConfigValue('spacing.margin.bottom', '1rem')}
                  onChange={(e) => updateConfigValue('spacing.margin.bottom', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Margen Izquierdo</Label>
                <Input
                  placeholder="ej: 1rem, 16px"
                  value={getConfigValue('spacing.margin.left', '1rem')}
                  onChange={(e) => updateConfigValue('spacing.margin.left', e.target.value)}
                />
              </div>
            </div>
            
            {/* Margin Preview */}
            <div className="mt-6 border p-4 rounded-md bg-gray-50">
              <h3 className="font-medium text-sm mb-4">Vista Previa:</h3>
              <div className="w-full h-64 relative bg-gray-200 overflow-hidden rounded">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div style={{ 
                    margin: `${getConfigValue('spacing.margin.top', '1rem')} ${getConfigValue('spacing.margin.right', '1rem')} ${getConfigValue('spacing.margin.bottom', '1rem')} ${getConfigValue('spacing.margin.left', '1rem')}`,
                    width: "80%",
                    height: "80%",
                    border: "2px dashed #0070f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                    position: "relative"
                  }}>
                    <div className="text-xs text-center">
                      Contenido con Margen<br/>
                      <span className="opacity-75">
                        {getConfigValue('spacing.margin.top', '1rem')} (superior) {getConfigValue('spacing.margin.right', '1rem')} (derecho)<br/>
                        {getConfigValue('spacing.margin.bottom', '1rem')} (inferior) {getConfigValue('spacing.margin.left', '1rem')} (izquierdo)
                      </span>
                    </div>
                    
                    {/* Margin indicators */}
                    <div className="absolute left-1/2 -top-3 -translate-x-1/2 text-[10px] bg-blue-200 rounded px-1">↕️ {getConfigValue('spacing.margin.top', '1rem')}</div>
                    <div className="absolute top-1/2 -right-3 -translate-y-1/2 text-[10px] bg-blue-200 rounded px-1">↔️ {getConfigValue('spacing.margin.right', '1rem')}</div>
                    <div className="absolute left-1/2 -bottom-3 -translate-x-1/2 text-[10px] bg-blue-200 rounded px-1">↕️ {getConfigValue('spacing.margin.bottom', '1rem')}</div>
                    <div className="absolute top-1/2 -left-3 -translate-y-1/2 text-[10px] bg-blue-200 rounded px-1">↔️ {getConfigValue('spacing.margin.left', '1rem')}</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="padding" className="mt-4">
            <div className="space-y-2 mb-4">
              <Label>Valor General (base)</Label>
              <Input
                placeholder="ej: 1rem, 16px"
                value={getConfigValue('spacing.padding.base', '1rem')}
                onChange={(e) => updateConfigValue('spacing.padding.base', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Este valor se usará como base general para el padding si los valores específicos no están definidos.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="space-y-2">
                <Label>Padding Superior</Label>
                <Input
                  placeholder="ej: 1rem, 16px"
                  value={getConfigValue('spacing.padding.top', '1rem')}
                  onChange={(e) => updateConfigValue('spacing.padding.top', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Padding Derecho</Label>
                <Input
                  placeholder="ej: 1rem, 16px"
                  value={getConfigValue('spacing.padding.right', '1rem')}
                  onChange={(e) => updateConfigValue('spacing.padding.right', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Padding Inferior</Label>
                <Input
                  placeholder="ej: 1rem, 16px"
                  value={getConfigValue('spacing.padding.bottom', '1rem')}
                  onChange={(e) => updateConfigValue('spacing.padding.bottom', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Padding Izquierdo</Label>
                <Input
                  placeholder="ej: 1rem, 16px"
                  value={getConfigValue('spacing.padding.left', '1rem')}
                  onChange={(e) => updateConfigValue('spacing.padding.left', e.target.value)}
                />
              </div>
            </div>
            
            {/* Padding Preview */}
            <div className="mt-6 border p-4 rounded-md bg-gray-50">
              <h3 className="font-medium text-sm mb-4">Vista Previa:</h3>
              <div className="w-full h-64 relative overflow-hidden rounded">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div style={{ 
                    border: "2px solid #0070f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                    position: "relative",
                    width: "80%",
                    height: "80%",
                  }}>
                    <div style={{ 
                      padding: `${getConfigValue('spacing.padding.top', '1rem')} ${getConfigValue('spacing.padding.right', '1rem')} ${getConfigValue('spacing.padding.bottom', '1rem')} ${getConfigValue('spacing.padding.left', '1rem')}`,
                      border: "1px dashed #666",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <div className="text-xs text-center">
                        Contenido con Padding<br/>
                        <span className="opacity-75">
                          {getConfigValue('spacing.padding.top', '1rem')} (superior) {getConfigValue('spacing.padding.right', '1rem')} (derecho)<br/>
                          {getConfigValue('spacing.padding.bottom', '1rem')} (inferior) {getConfigValue('spacing.padding.left', '1rem')} (izquierdo)
                        </span>
                      </div>
                    </div>
                    
                    {/* Padding indicators */}
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 transform text-[10px] bg-green-200 rounded px-1">↕️ {getConfigValue('spacing.padding.top', '1rem')}</div>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 transform text-[10px] bg-green-200 rounded px-1">↔️ {getConfigValue('spacing.padding.right', '1rem')}</div>
                    <div className="absolute left-1/2 bottom-0 -translate-x-1/2 transform text-[10px] bg-green-200 rounded px-1">↕️ {getConfigValue('spacing.padding.bottom', '1rem')}</div>
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 transform text-[10px] bg-green-200 rounded px-1">↔️ {getConfigValue('spacing.padding.left', '1rem')}</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
