"use client";

import React, { useEffect } from "react";
import { Controller, Control } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RgbaColorPicker } from "react-colorful";
import { ImageUploaderSpinner } from "@/components/core/ImageUploaderSpinner";

// Función util para parsear RGBA/HEXA usados por react-colorful
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
    return { r: +r, g: +g, b: +b, a: a !== undefined && a !== "" ? +a : 1 };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}
function isColor(str: string) {
  if (!str) return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(str)
    || /^rgba?\(/.test(str);
}
function isCssGradient(str: string) {
  return typeof str === "string" && str.startsWith("linear-gradient");
}

interface LoadingSpinnerConfig {
  enabled: boolean;
  overlayColor: string;
  spinnerImageUrl?: string;
}

interface LoadingSpinnerFormValues {
  loadingSpinnerConfig: LoadingSpinnerConfig;
  [key: string]: any;
}

interface LoadingSpinnerTabProps {
  control: Control<LoadingSpinnerFormValues>;
  watch: any;
  setValue: any;
  selectedOverlayColor: string;
  setSelectedOverlayColor: (color: string) => void;
}

export default function LoadingSpinnerTab({
  control,
  watch,
  setValue,
  selectedOverlayColor,
  setSelectedOverlayColor
}: LoadingSpinnerTabProps) {
  const spinnerEnabled = watch("loadingSpinnerConfig.enabled");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spinner de Carga</CardTitle>
        <CardDescription>
          Configura el comportamiento y apariencia del spinner de carga durante la navegación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Controller
              name="loadingSpinnerConfig.enabled"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="spinner-enabled"
                />
              )}
            />
            <Label htmlFor="spinner-enabled">Activar Spinner de Carga</Label>
          </div>
          
          {spinnerEnabled && (
            <>
              <div className="space-y-2">
                <Label>Color o Degradado de Overlay</Label>
                <div className="mt-2 flex flex-col gap-2">
                  {/* ColorPicker avanzado con transparencia */}
                  <div className="w-full max-w-[240px]">
                    <RgbaColorPicker
                      color={parseColor(selectedOverlayColor)}
                      onChange={rgba => {
                        const rgbaVal = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
                        setSelectedOverlayColor(rgbaVal);
                        setValue("loadingSpinnerConfig.overlayColor", rgbaVal);
                      }}
                    />
                  </div>
                  {/* Input libre: hex, rgba, gradient */}
                  <Input
                    className="mt-2 font-mono"
                    value={selectedOverlayColor}
                    onChange={e => {
                      setSelectedOverlayColor(e.target.value);
                      setValue("loadingSpinnerConfig.overlayColor", e.target.value);
                    }}
                    placeholder="RGBA, HEXA, linear-gradient(...)"
                  />
                  {/* Preview visual */}
                  <div className="rounded border h-10 mt-2 flex items-center justify-center"
                    style={{
                      background: isCssGradient(selectedOverlayColor)
                        ? selectedOverlayColor
                        : isColor(selectedOverlayColor)
                          ? selectedOverlayColor
                          : "#d1d5db", // fallback gris
                      minHeight: 40
                    }}
                  >
                    <span className="text-xs text-slate-700">
                      Vista previa overlay
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Admite RGBA/HEXA para transparencia, o cualquier gradiente CSS (por ejemplo: <br />
                    <span className="font-mono">linear-gradient(90deg, #ff0000aa 0%, #0000ffaa 100%)</span>)
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Imagen de Spinner Personalizada</Label>
                <Controller
                  name="loadingSpinnerConfig.spinnerImageUrl"
                  control={control}
                  render={({ field }) => (
                    <ImageUploaderSpinner
                      value={field.value || ""}
                      onChange={(url: string) => field.onChange(url)}
                      label="Subir imagen para spinner (opcional)"
                    />
                  )}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
