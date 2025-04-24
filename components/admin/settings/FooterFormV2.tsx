"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { fetchFooterConfig, saveFooterConfig, FooterConfig } from "@/actions/footer-actions";
import { WIDGET_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import HtmlEditor from "@/components/core/HtmlEditor";
import { useCurrentUserRole, checkUserRole } from "@/lib/auth";

const WidgetsSection = ({ 
  fields, 
  append, 
  remove, 
  control 
}) => {
  return (
    <div className="space-y-2">
      <Label>Widgets</Label>
      <div className="space-y-2">
        {fields.map((field, idx) => (
          <div key={field.id} className="flex items-center gap-2 border p-3 rounded">
            <Controller
              name={`widgets.${idx}.type`}
              control={control}
              render={({ field: typeField }) => (
                <Select 
                  onValueChange={typeField.onChange} 
                  defaultValue={typeField.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un tipo de widget" />
                  </SelectTrigger>
                  <SelectContent>
                    {WIDGET_TYPES.map(w => (
                      <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => remove(idx)}
              aria-label="Eliminar widget"
              type="button"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => append({ type: WIDGET_TYPES[0]?.value || 'latest_posts', config: {} })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir widget
        </Button>
      </div>
    </div>
  );
};
