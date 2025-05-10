"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HtmlEditor from "@/components/core/HtmlEditor";
import { Textarea } from "@/components/ui/textarea";

// Importar las acciones del servidor
import { createPage, updatePage, PageFormData } from "@/actions/page-actions";

// Props for the component
interface PageFormProps {
  pageId?: number;
  initialData?: PageFormData;
}

export default function PageForm({ pageId, initialData }: PageFormProps) {
  const router = useRouter();
  const isEditMode = !!pageId;

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
      showHeader: true,
      showFooter: true,
      showSidebar: false,
      sidebarPosition: "left",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: ""
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

  // Handle form submission
  const onSubmit = async (data: PageFormData) => {
    try {
      // Include the editor content
      data.contentHtml = editorContent;
      
      let result;
      
      // Usar acciones del servidor en lugar de la API
      if (isEditMode && pageId) {
        result = await updatePage(pageId, data);
      } else {
        result = await createPage(data);
      }

      // Verificar si hubo errores
      if (!result.success) {
        throw new Error(result.error || "Error al guardar la página");
      }
      
      // Mostrar mensaje de éxito
      toast.success(
        isEditMode ? "Página actualizada correctamente" : "Página creada correctamente"
      );
      
      // Redirigir al listado de páginas
      router.push("/admin/pages");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar la página");
      console.error(error);
    }
  };

  // Handle editor content changes
  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const showSidebar = watch("showSidebar");

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

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium">Opciones de Visualización</h3>
          
          <Alert className="bg-blue-50 mb-4">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Las asignaciones de tema para esta página se configuran en 
              <strong>' Administración → Configuración → Apariencia → Asignaciones Específicas '</strong>
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="showHeader"
                control={control}
                defaultValue={initialData?.showHeader ?? true}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showHeader"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="showHeader">Mostrar Cabecera</Label>
                  </div>
                )}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Controller
                name="showFooter"
                control={control}
                defaultValue={initialData?.showFooter ?? true}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showFooter"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="showFooter">Mostrar Pie de Página</Label>
                  </div>
                )}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Controller
                name="showSidebar"
                control={control}
                defaultValue={initialData?.showSidebar ?? false}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showSidebar"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="showSidebar">Mostrar Barra Lateral</Label>
                  </div>
                )}
              />
            </div>
            
            {showSidebar && (
              <div className="space-y-2">
                <Label htmlFor="sidebarPosition">Posición de la Barra Lateral</Label>
                <Controller
                  name="sidebarPosition"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value: "left" | "right") => field.onChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una posición" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Izquierda</SelectItem>
                        <SelectItem value="right">Derecha</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium">Opciones SEO</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Estos campos son opcionales. Si se dejan vacíos, se utilizarán los valores predeterminados
            configurados en la sección de SEO.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Título Meta</Label>
            <Input
              id="metaTitle"
              {...register("metaTitle")}
              placeholder="Título para SEO (opcional)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Descripción Meta</Label>
            <Textarea
              id="metaDescription"
              {...register("metaDescription")}
              placeholder="Descripción breve para motores de búsqueda (opcional)"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="metaKeywords">Palabras Clave</Label>
            <Input
              id="metaKeywords"
              {...register("metaKeywords")}
              placeholder="Palabras clave separadas por comas (opcional)"
            />
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
