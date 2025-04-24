"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetchFooterConfig, saveFooterConfig } from "@/actions/footer-actions";

export default function MinimalFooterForm() {
  const [height, setHeight] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const footerConfig = await fetchFooterConfig();
        if (footerConfig) {
          setHeight(footerConfig.height || "");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading config:", error);
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await saveFooterConfig({
        height,
        secondaryHtml: "",
        widgets: []
      });
      if (result.success) {
        toast.success("Configuración guardada");
      } else {
        toast.error("Error al guardar");
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="height">Altura del pie de página</Label>
        <Input
          id="height"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="Ejemplo: 200px"
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
