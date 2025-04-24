"use client";

import React from "react";
import { Controller, Control } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ThemeSwitcherConfig {
  visible: boolean;
  style: "icon" | "icon_text";
  position: "bottom_right" | "bottom_left" | "top_right" | "top_left";
}

interface ThemeSwitcherFormValues {
  themeSwitcherConfig: ThemeSwitcherConfig;
  [key: string]: any;
}

interface ThemeSwitcherTabProps {
  control: Control<ThemeSwitcherFormValues>;
  watch: any;
}

export default function ThemeSwitcherTab({ control, watch }: ThemeSwitcherTabProps) {
  const switcherVisible = watch("themeSwitcherConfig.visible");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interruptor de Tema</CardTitle>
        <CardDescription>
          Configura la apariencia y posición del interruptor de temas claro/oscuro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Controller
              name="themeSwitcherConfig.visible"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="switcher-visible"
                />
              )}
            />
            <Label htmlFor="switcher-visible">Mostrar Interruptor de Tema</Label>
          </div>
          
          {switcherVisible && (
            <>
              <div>
                <Label htmlFor="switcher-style">Estilo</Label>
                <Controller
                  name="themeSwitcherConfig.style"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un estilo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="icon">Solo Icono</SelectItem>
                        <SelectItem value="icon_text">Icono + Texto</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              
              <div>
                <Label htmlFor="switcher-position">Posición</Label>
                <Controller
                  name="themeSwitcherConfig.position"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una posición..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom_right">Abajo Derecha</SelectItem>
                        <SelectItem value="bottom_left">Abajo Izquierda</SelectItem>
                        <SelectItem value="top_right">Arriba Derecha</SelectItem>
                        <SelectItem value="top_left">Arriba Izquierda</SelectItem>
                      </SelectContent>
                    </Select>
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
