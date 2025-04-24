'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { HexColorPicker, RgbaColorPicker } from 'react-colorful';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  supportGradient?: boolean;
  showAlpha?: boolean;
}

// Función para convertir hex a rgba
const hexToRgba = (hex: string, alpha = 1) => {
  if (!hex) return { r: 0, g: 0, b: 0, a: alpha };
  
  // Expandir shorthand form (#03F) a completo (#0033FF)
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: alpha
  } : { r: 0, g: 0, b: 0, a: alpha };
};

// Función para extraer valores rgba de un string rgba
const parseRgba = (rgba: string) => {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] ? parseFloat(match[4]) : 1
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
};

// Función para convertir rgb a hex
const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

export function ColorPicker({
  label,
  value,
  onChange,
  supportGradient = false,
  showAlpha = true
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  
  // Estado para el tipo de selector (color sólido o degradado)
  const [pickerType, setPickerType] = useState<'color' | 'gradient'>(
    value.startsWith('linear-gradient') || value.startsWith('radial-gradient') 
      ? 'gradient' 
      : 'color'
  );
  
  // Estado para manejar el color actual
  const [color, setColor] = useState(() => {
    if (value.startsWith('rgba')) {
      return parseRgba(value);
    } else if (value.startsWith('#')) {
      return hexToRgba(value);
    } else {
      return { r: 0, g: 0, b: 0, a: 1 };
    }
  });

  // Función para manejar el cambio de color
  const handleColorChange = useCallback((newColor: any) => {
    setColor(newColor);
    
    if (!showAlpha || newColor.a === 1) {
      // Si no hay transparencia, usamos formato hex para mayor compatibilidad
      onChange(rgbToHex(newColor.r, newColor.g, newColor.b));
    } else {
      // Si hay transparencia, usamos formato rgba
      onChange(`rgba(${newColor.r}, ${newColor.g}, ${newColor.b}, ${newColor.a})`);
    }
  }, [onChange, showAlpha]);

  // Actualizar el estado local cuando cambia el valor externo (inicialización)
  useEffect(() => {
    // Solo actualizamos en la inicialización para evitar ciclos
    if (value && !color.r && !color.g && !color.b) {
      if (value.startsWith('rgba')) {
        setColor(parseRgba(value));
      } else if (value.startsWith('#')) {
        setColor(hexToRgba(value));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-2 mb-4">
      <Label>{label}</Label>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="flex items-center space-x-2 cursor-pointer">
            <div
              className="w-10 h-10 rounded border"
              style={{ 
                backgroundColor: value
              }}
            />
            <Input
              value={value}
              readOnly
              className="cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>{label}</DialogTitle>
          
          <div className="space-y-3 mt-4">
            {/* Selector de tipo de color */}
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
              // Selector de color sólido
              showAlpha ? (
                <RgbaColorPicker color={color} onChange={handleColorChange} />
              ) : (
                <HexColorPicker color={rgbToHex(color.r, color.g, color.b)} onChange={(hex) => {
                  const rgba = hexToRgba(hex, color.a);
                  handleColorChange(rgba);
                }} />
              )
            ) : (
              // Selector de degradado
              <div className="space-y-4">
                <div 
                  className="w-full h-20 rounded"
                  style={{ 
                    background: `linear-gradient(to right, ${rgbToHex(color.r, color.g, color.b)}, #ffffff)` 
                  }}
                />
                
                <div className="space-y-2">
                  <Label>Tipo de Degradado</Label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => {/* Lineal */}}
                      className="flex-1"
                    >
                      Lineal
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {/* Radial */}}
                      className="flex-1"
                    >
                      Radial
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue="to right"
                  >
                    <option value="to right">→ Derecha</option>
                    <option value="to left">← Izquierda</option>
                    <option value="to bottom">↓ Abajo</option>
                    <option value="to top">↑ Arriba</option>
                    <option value="to bottom right">↘ Abajo-Derecha</option>
                    <option value="to bottom left">↙ Abajo-Izquierda</option>
                    <option value="to top right">↗ Arriba-Derecha</option>
                    <option value="to top left">↖ Arriba-Izquierda</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Colores del Degradado</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border cursor-pointer"
                      style={{ backgroundColor: rgbToHex(color.r, color.g, color.b) }}
                    />
                    <Input 
                      value={rgbToHex(color.r, color.g, color.b)}
                      readOnly
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div 
                      className="w-8 h-8 rounded border cursor-pointer"
                      style={{ backgroundColor: "#FFFFFF" }}
                    />
                    <Input 
                      value="#FFFFFF" 
                      readOnly
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Información adicional y código de color */}
            <div className="pt-2">
              <Input
                value={value}
                onChange={(e) => {
                  // Permitir edición manual del valor
                  onChange(e.target.value);
                  
                  // Intentar actualizar el estado del color
                  if (e.target.value.startsWith('rgba')) {
                    setColor(parseRgba(e.target.value));
                  } else if (e.target.value.startsWith('#')) {
                    setColor(hexToRgba(e.target.value));
                  }
                }}
                placeholder="#RRGGBB o rgba(r,g,b,a)"
              />
            </div>
            
            {/* Botones */}
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
