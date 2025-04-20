"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HtmlEditor from "@/components/core/HtmlEditor";

// Interfaz para el tema
interface ThemePreset {
  id: number;
  name: string;
}

// Fetcher para SWR
const fetcher = (url: string) => fetch(url).then(async res => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar los datos');
    }
    return res.json();
});

// Type for the form data
interface PageFormData {
  title: string;
  slug: string;
  contentHtml: string;
  isVisible: boolean;
  includeInMenu: boolean;
  lightThemeId?: number | null;
  darkThemeId?: number | null;
}

// Props for the component
interface PageFormProps {
  pageId?: number;
  initialData?: PageFormData;
}

export default function PageForm({ pageId, initialData }: PageFormProps) {
  const router = useRouter();
  const isEditMode = !!pageId;
  
  // Cargar lista de temas disponibles
  const { data: themes } = useSWR<ThemePreset[]>('/api/theme/presets', fetcher, {
      revalidateOnFocus: false,
  });

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PageFormData>({
    defaultValues: initialData || {
      title: "",
      slug: "",
      contentHtml: "",
      isVisible: true,
      includeInMenu: false,
    },
  });

  // Watch title for slug generation
  const title = watch("title");
  const [editorContent, setEditorContent] = useState(initialData?.contentHtml || "");

  // Auto-generate slug from title if empty
  useEffect(() => {
    if (!isEditMode || (isEditMode && !initialData?.slug)) {
      const generateSlug = async () => {
        try {
          // Call the utility function from the server
          const response = await fetch("/api/utils/generate-slug", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ title }),
          });

          if (!response.ok) {
            throw new Error("Error generating slug");
          }

          const data = await response.json();
          setValue("slug", data.slug);
        } catch (error) {
          console.error("Error generating slug:", error);
          // Fallback slug generation in case the API fails
          setValue(
            "slug",
            title
              .toLowerCase()
              .trim()
              .replace(/[^\w\s-]/g, "")
              .replace(/[\s_-]+/g, "-")
              .replace(/^-+|-+$/g, "")
          );
        }
      };

      if (title) {
        generateSlug();
      }
    }
  }, [title, setValue, isEditMode, initialData?.slug]);

  // Manejar cambios en selección de tema claro
  const handleLightThemeChange = (value: string) => {
    // Si es "default" o cadena vacía, establecer como null
    setValue('lightThemeId', value && value !== 'default' ? parseInt(value) : null);
  };

  // Manejar cambios en selección de tema oscuro
  const handleDarkThemeChange = (value: string) => {
    // Si es "default" o cadena vacía, establecer como null  
    setValue('darkThemeId', value && value !== 'default' ? parseInt(value) : null);
  };

  // Handle form submission
  const onSubmit = async (data: PageFormData) => {
    try {
      // Include the editor content
      data.contentHtml = editorContent;
      
      // Extraer IDs de temas para manejarlos separadamente
      const { lightThemeId, darkThemeId, ...pageData } = data;

      const url = isEditMode ? `/api/pages/${pageId}` : "/api/pages";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar la página");
      }

      // Si la creación/actualización de la página fue exitosa, guardar los temas
      if (response.ok) {
        // Obtener el ID de la página recién creada o la existente
        const responseData = await response.json();
        const currentPageId = responseData.id || pageId;
        
        // Actualizar asignaciones de temas si se proporcionaron
        if (lightThemeId !== undefined || darkThemeId !== undefined) {
          try {
            // Crear/actualizar asignaciones de temas
            let themeAssignments = {};
            
            // Si existe, intenta cargar themeAssignments actual
            const globalConfigRes = await fetch('/api/settings/global');
            if (globalConfigRes.ok) {
              const globalConfig = await globalConfigRes.json();
              if (globalConfig && globalConfig.themeAssignments) {
                try {
                  themeAssignments = JSON.parse(globalConfig.themeAssignments);
                } catch (e) {
                  console.error('Error parsing theme assignments', e);
                }
              }
            }
            
            // Actualizar asignación para esta página específica
            themeAssignments = {
              ...themeAssignments,
              pages: {
                ...(themeAssignments as any).pages,
                [currentPageId]: {
                  light: lightThemeId,
                  dark: darkThemeId
                }
              }
            };
            
            // Guardar asignaciones de temas en configuración global
            const themeResponse = await fetch('/api/settings/global', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                themeAssignments: JSON.stringify(themeAssignments)
              }),
            });
            
            if (!themeResponse.ok) {
              console.warn('Página guardada, pero hubo un error al guardar las asignaciones de tema');
            }
          } catch (themeError) {
            console.error('Error guardando asignaciones de tema:', themeError);
          }
        }
        
        toast.success(
          isEditMode ? "Página actualizada correctamente" : "Página creada correctamente"
        );
        router.push("/admin/pages");
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar la página");
      }
    } catch (error: any) {
      toast.error(error.message || "Error al guardar la página");
      console.error(error);
    }
  };

  // Handle editor content changes
  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            {...register("title", { required: "El título es obligatorio" })}
            placeholder="Título de la página"
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            {...register("slug", { required: "El slug es obligatorio" })}
            placeholder="slug-de-la-pagina"
            className={errors.slug ? "border-red-500" : ""}
          />
          {errors.slug && (
            <p className="text-red-500 text-sm">{errors.slug.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Identificador único para la URL. Ejemplo: about-us
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Contenido</Label>
          <div className={errors.contentHtml ? "border border-red-500 rounded-lg" : ""}>
            <HtmlEditor
              value={editorContent}
              onChange={handleEditorChange}
              label="Contenido"
            />
          </div>
          {errors.contentHtml && (
            <p className="text-red-500 text-sm">{errors.contentHtml.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isVisible"
            {...register("isVisible")}
            defaultChecked={initialData?.isVisible ?? true}
          />
          <Label htmlFor="isVisible">Página visible públicamente</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="includeInMenu"
            {...register("includeInMenu")}
            defaultChecked={initialData?.includeInMenu ?? false}
          />
          <Label htmlFor="includeInMenu">Incluir en el menú de navegación</Label>
        </div>
        
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium">Tema Visual</h3>
          
          {/* Tema para Modo Claro */}
          <div className="space-y-2">
            <Label htmlFor="lightThemeId">Tema para Modo Claro</Label>
            <Controller
              name="lightThemeId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={handleLightThemeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tema..." />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="default">Tema por defecto del sitio</SelectItem>
                    {themes?.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id.toString()}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-sm text-muted-foreground">
              Tema personalizado para el modo claro (opcional)
            </p>
          </div>
          
          {/* Tema para Modo Oscuro */}
          <div className="space-y-2">
            <Label htmlFor="darkThemeId">Tema para Modo Oscuro</Label>
            <Controller
              name="darkThemeId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={handleDarkThemeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tema..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Tema por defecto del sitio</SelectItem>
                    {themes?.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id.toString()}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-sm text-muted-foreground">
              Tema personalizado para el modo oscuro (opcional)
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/pages")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando..."
            : isEditMode
            ? "Actualizar Página"
            : "Crear Página"}
        </Button>
      </div>
    </form>
  );
}
