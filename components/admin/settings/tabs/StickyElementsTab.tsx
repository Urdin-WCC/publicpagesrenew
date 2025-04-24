"use client";

import React from "react";
import { Controller, Control } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StickyElementsConfig {
  header: boolean;
  sidebar: boolean;
  footer: boolean;
  themeSwitcher: boolean;
}

interface StickyElementsFormValues {
  stickyElementsConfig: StickyElementsConfig;
  [key: string]: any;
}

interface StickyElementsTabProps {
  control: Control<StickyElementsFormValues>;
}

export default function StickyElementsTab({ control }: StickyElementsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Elementos Fijos</CardTitle>
        <CardDescription>
          Define qué elementos permanecerán fijos durante el desplazamiento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="stickyElementsConfig.header"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="sticky-header"
                  />
                )}
              />
              <Label htmlFor="sticky-header">Cabecera Fija</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Controller
                name="stickyElementsConfig.sidebar"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="sticky-sidebar"
                  />
                )}
              />
              <Label htmlFor="sticky-sidebar">Barra Lateral Fija</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Controller
                name="stickyElementsConfig.footer"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="sticky-footer"
                  />
                )}
              />
              <Label htmlFor="sticky-footer">Pie de Página Fijo</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Controller
                name="stickyElementsConfig.themeSwitcher"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="sticky-switcher"
                  />
                )}
              />
              <Label htmlFor="sticky-switcher">Interruptor de Tema Fijo</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
