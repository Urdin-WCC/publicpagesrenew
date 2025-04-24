'use client';

import { ThemeConfig } from '@/types/theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface EffectsSectionProps {
  config: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
}

export function EffectsSection({ config, onChange }: EffectsSectionProps) {
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

  const animationType = getConfigValue('effects.animation', 'none');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Efectos y Animaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="transitions" className="text-base">Transiciones al Hover</Label>
            <Switch
              id="transitions"
              checked={getConfigValue('effects.transitions', false)}
              onCheckedChange={(checked) => updateConfigValue('effects.transitions', checked)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Habilita efectos de transición suave al pasar el ratón sobre botones, enlaces, iconos y otros elementos interactivos.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label className="text-base">Animación al Hover</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Define cómo reaccionan visualmente los elementos clicables (botones, enlaces, iconos) cuando el usuario pasa el ratón sobre ellos.
          </p>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={animationType}
            onChange={(e) => updateConfigValue('effects.animation', e.target.value)}
          >
            <option value="none">Ninguna</option>
            <option value="zoomin">Zoom In - Elemento crece ligeramente</option>
            <option value="zoomout">Zoom Out - Elemento se reduce ligeramente</option>
            <option value="scale">Escala - Cambio de tamaño adaptativo</option>
            <option value="glow">Brillo - Resplandor alrededor del elemento</option>
            <option value="bounce">Rebote - Pequeño salto del elemento</option>
            <option value="pulse">Pulso - Efecto de latido</option>
            <option value="shake">Agitar - Pequeño movimiento lateral</option>
            <option value="slide">Deslizar - Desplazamiento sutil</option>
            <option value="custom">Personalizada - Definir CSS</option>
          </select>
        </div>
        
        {animationType === 'custom' && (
          <div className="space-y-2">
            <Label>Animación Personalizada (CSS)</Label>
            <textarea
              rows={4}
              value={getConfigValue('effects.customAnimation', '')}
              onChange={(e) => updateConfigValue('effects.customAnimation', e.target.value)}
              placeholder="@keyframes miAnimacion { ... }"
              className="w-full min-h-24 resize-y p-2 font-mono rounded-md border border-input bg-background text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Define una animación CSS personalizada utilizando reglas @keyframes.
            </p>
          </div>
        )}
        
        {/* Live Preview */}
        <div className="mt-6 border p-4 rounded-md">
          <h3 className="font-medium text-sm mb-2">Vista Previa:</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              className={`px-4 py-2 bg-blue-500 text-white rounded hover-effect-${animationType}`}
              style={{
                transition: getConfigValue('effects.transitions', false) ? 'all 0.3s ease' : 'none'
              }}
            >
              Botón con Efecto
            </button>
            
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()}
              className={`text-blue-500 underline hover-effect-${animationType}`}
              style={{
                transition: getConfigValue('effects.transitions', false) ? 'all 0.3s ease' : 'none'
              }}
            >
              Enlace con Efecto
            </a>
            
            <div 
              className={`w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white cursor-pointer hover-effect-${animationType}`}
              style={{
                transition: getConfigValue('effects.transitions', false) ? 'all 0.3s ease' : 'none'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </div>
          </div>
          
          <style jsx>{`
            .hover-effect-zoomin:hover {
              transform: scale(1.05);
            }
            .hover-effect-zoomout:hover {
              transform: scale(0.95);
            }
            .hover-effect-scale:hover {
              transform: scale(1.1);
            }
            .hover-effect-glow:hover {
              box-shadow: 0 0 8px rgba(66, 153, 225, 0.6);
            }
            .hover-effect-bounce:hover {
              animation: bounce 0.5s ease;
            }
            .hover-effect-pulse:hover {
              animation: pulse 1s infinite;
            }
            .hover-effect-shake:hover {
              animation: shake 0.5s ease;
            }
            .hover-effect-slide:hover {
              transform: translateX(5px);
            }
            
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }
            
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-2px); }
              50% { transform: translateX(0); }
              75% { transform: translateX(2px); }
            }
            
            ${animationType === 'custom' ? getConfigValue('effects.customAnimation', '') : ''}
          `}</style>
          
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Pasa el ratón por encima de los elementos para ver el efecto
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
