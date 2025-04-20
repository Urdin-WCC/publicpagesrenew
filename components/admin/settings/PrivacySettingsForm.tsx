"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface PrivacySettingsData {
  cookieBannerText: string;
  cookieBannerLinkPageId: number | null;
}

interface Page {
  id: number;
  title: string;
  slug: string;
}

interface PrivacySettingsFormProps {
  initialData: PrivacySettingsData;
  pages: Page[];
}

export default function PrivacySettingsForm({
  initialData,
  pages,
}: PrivacySettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PrivacySettingsData>({
    defaultValues: {
      cookieBannerText: initialData.cookieBannerText || "",
      cookieBannerLinkPageId: initialData.cookieBannerLinkPageId,
    },
  });

  // Get the current values for the form
  const cookieBannerLinkPageId = watch("cookieBannerLinkPageId");

  // Handle select change for privacy policy page
  const handlePrivacyPageChange = (value: string) => {
    setValue(
      "cookieBannerLinkPageId",
      value ? parseInt(value) : null
    );
  };

  // Handle form submission
  const onSubmit = async (data: PrivacySettingsData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/settings/privacy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al guardar la configuración de privacidad"
        );
      }

      toast.success("Configuración de privacidad actualizada");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar la configuración de privacidad");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cookieBannerText">Texto del Banner de Cookies</Label>
          <Textarea
            id="cookieBannerText"
            {...register("cookieBannerText", {
              required: "El texto del banner es obligatorio",
            })}
            placeholder="Usamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestra política de cookies."
            rows={4}
            className={errors.cookieBannerText ? "border-red-500" : ""}
          />
          {errors.cookieBannerText && (
            <p className="text-red-500 text-sm">{errors.cookieBannerText.message}</p>
          )}
          <p className="text-muted-foreground text-sm">
            Este texto se mostrará en el banner de cookies en la parte inferior de la página.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cookieBannerLinkPageId">Enlace a Política de Privacidad</Label>
          <Select
            value={cookieBannerLinkPageId?.toString() || ""}
            onValueChange={handlePrivacyPageChange}
          >
            <SelectTrigger id="cookieBannerLinkPageId" className="w-full">
              <SelectValue placeholder="Seleccionar página..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Ninguna</SelectItem>
              {pages.map((page) => (
                <SelectItem key={page.id} value={page.id.toString()}>
                  {page.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-sm">
            Selecciona la página que contiene tu política de privacidad.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </div>
    </form>
  );
}
