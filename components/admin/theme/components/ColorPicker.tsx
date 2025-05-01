'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RgbaColorPicker } from 'react-colorful';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  supportGradient?: boolean;
  showAlpha?: boolean;
}

// Util para parsear string de color a objeto rgba (soporta #hex, rgba(), fallback negro)
function parseColor(color: string) {
  if (!color) return { r: 0, g: 0, b: 0, a: 1 };
  if (color.startsWith('#')) {
    if (color.length === 9) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const a = +(parseInt(color.slice(7, 9), 16) / 255).toFixed(2);
      return { r, g, b, a };
    }
    if (color.length === 7) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return { r, g, b, a: 1 };
    }
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  // RGBA
  const match = color.match(/rgba?\s*\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)[,\s]*([\d.]*)\)/);
  if (match) {
    const [_, r, g, b, a] = match;
    return { r: +r, g: +g, b: +b, a: a !== undefined && a !== '' ? +a : 1 };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}
function isColor(str: string) {
  if (!str) return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(str)
    || /^rgba?\(/.test(str);
}
function isCssGradient(str: string) {
  return typeof str === 'string' && str.startsWith('linear-gradient');
}

export function ColorPicker({
  label,
  value,
  onChange,
  supportGradient = false,
  showAlpha = true
}: ColorPickerProps) {
  // Puede ser color plano (hex/rgba) o gradiente CSS
  const [internal, setInternal] = useState(value);

  // Sincroniza externo-interno
  if (internal !== value) setInternal(value);

  // Callback colorpicker para color plano
  const handleRgbaChange = (rgba: { r: number; g: number; b: number; a: number }) => {
    const rgbaStr = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
    setInternal(rgbaStr);
    onChange(rgbaStr);
  };

  // Cambio manual input (hex, rgba, gradiente)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternal(e.target.value);
    onChange(e.target.value);
  };

  const showPicker = !isCssGradient(internal);

  return (
    <div className="space-y-2 mb-4">
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        {/* Input para hex, rgba o gradiente */}
        <Input
          className="font-mono"
          value={internal}
          onChange={handleInputChange}
          placeholder={supportGradient ? "RGBA, HEXA o linear-gradient(...)" : "RGBA o HEXA"}
        />

        {/* Solo muestra el picker si no es gradiente */}
        {showPicker && (
          <div className="w-full max-w-[240px]">
            <RgbaColorPicker
              color={parseColor(internal)}
              onChange={handleRgbaChange}
            />
          </div>
        )}

        {/* Preview visual */}
        <div className="rounded border h-10 flex items-center justify-center"
          style={{
            background: isCssGradient(internal)
              ? internal
              : isColor(internal)
                ? internal
                : "#d1d5db",
            minHeight: 40
          }}>
          <span className="text-xs text-slate-700">
            Vista previa
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {supportGradient
            ? <>Admite RGBA/HEXA para transparencia, o cualquier gradiente CSS (por ejemplo:<br />
              <span className="font-mono">linear-gradient(90deg, #ff0000aa 0%, #0000ffaa 100%)</span>)
            </>
            : <>Admite RGBA/HEXA para transparencia.</>}
        </p>
      </div>
    </div>
  );
}
