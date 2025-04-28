"use client";

import React, { useEffect } from "react";
import { Controller, Control } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CirclePicker } from "react-color";
import ImageUploader from "@/components/core/ImageUploader";

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
                <Label>Color de Overlay</Label>
                <div className="mt-2">
                  <CirclePicker
                    color={selectedOverlayColor}
                    onChange={(color) => {
                      setSelectedOverlayColor(color.hex);
                      setValue("loadingSpinnerConfig.overlayColor", color.hex);
                    }}
                    colors={['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39']}
                  />
                  <Input 
                    className="mt-2"
                    value={selectedOverlayColor} 
                    onChange={(e) => {
                      setSelectedOverlayColor(e.target.value);
                      setValue("loadingSpinnerConfig.overlayColor", e.target.value);
                    }} 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Utiliza valores RGBA o HEXA para controlar la opacidad (ej: #00000080)
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Imagen de Spinner Personalizada</Label>
                <Controller
                  name="loadingSpinnerConfig.spinnerImageUrl"
                  control={control}
                  render={({ field }) => (
                    <ImageUploader
                      value={field.value || ""}
                      onChange={(url) => field.onChange(url)}
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
