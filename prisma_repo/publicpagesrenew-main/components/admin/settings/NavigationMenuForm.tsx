"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchNavigationMenu, saveNavigationMenu } from "@/actions/menu-actions";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

// Tipos para los elementos del menú
interface MenuItem {
  id: string;
  label: string;
  target: string;
  customUrl?: string;
  openInNewTab: boolean;
}

// Tipos para el formulario
interface MenuFormData {
  items: MenuItem[];
}

// Fetcher para SWR
const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al cargar los datos');
  }
  return res.json();
});

// Interfaz para las páginas estáticas
interface StaticPage {
  id: number;
  title: string;
  slug: string;
}

export default function NavigationMenuForm() {
  // Cargar lista de páginas estáticas
  const { data: staticPages, error: pagesError } = useSWR<StaticPage[]>('/api/pages', fetcher, {
    revalidateOnFocus: false,
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<MenuFormData>({
    defaultValues: {
      items: []
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "items"
  });

  // Mover un elemento hacia arriba
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
    }
  };

  // Mover un elemento hacia abajo
  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  };

  // Cargar datos del menú al montar el componente
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        console.log("🔍 Cargando datos del menú directamente...");
        
        // Usar la nueva función fetchNavigationMenu que obtiene directamente el menú
        const result = await fetchNavigationMenu();
        console.log("📦 Resultado recibido:", result);
        
        if (result && result.items) {
          console.log("✅ Menú encontrado, elementos:", result.items.length);
          console.log("📝 Estableciendo valores en el formulario:", result.items);
          
          // Establecer los items directamente en el formulario
          setValue('items', result.items);
          console.log("✅ Valores establecidos correctamente");
          
        } else {
          console.warn("⚠️ No se encontraron elementos en el menú");
          // Menú vacío
          setValue('items', []);
        }
      } catch (error) {
        console.error('❌ Error al cargar los datos del menú:', error);
        if (error instanceof Error) {
          console.error('Mensaje de error:', error.message);
          console.error('Stack trace:', error.stack);
        }
        toast.error('Error al cargar los datos del menú');
      }
    };

    loadMenuData();
  }, [setValue]);

  // Manejar envío del formulario
  const onSubmit = async (data: MenuFormData) => {
    try {
      // Asegurarse de que no hay campos vacíos
      for (let item of data.items) {
        if (!item.label.trim()) {
          toast.error('Todos los elementos del menú deben tener un texto');
          return;
        }
        
        if (item.target === 'custom' && (!item.customUrl || !item.customUrl.trim())) {
          toast.error('Las URLs personalizadas no pueden estar vacías');
          return;
        }
      }

      // Usar la nueva función saveNavigationMenu que guarda directamente los elementos
      const result = await saveNavigationMenu(data.items);

      if (result.success) {
        toast.success('Menú de navegación actualizado correctamente');
      } else {
        toast.error(result.message || 'Error al guardar el menú');
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      toast.error('Error al guardar el menú de navegación');
    }
  };

  // Agregar un nuevo elemento al menú
  const addMenuItem = () => {
    append({
      id: `menu-item-${Date.now()}`,
      label: '',
      target: '',
      customUrl: '',
      openInNewTab: false
    });
  };

  // Renderizar el formulario
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-bold mb-4">Elementos del Menú de Navegación</h2>
          <p className="text-gray-500 mb-6">
            Configura los elementos que se mostrarán en el menú de navegación de tu sitio.
            Utiliza las flechas para cambiar el orden de los elementos.
          </p>
          
          <div className="space-y-4 mb-4">
            {fields.map((item, index) => (
              <div key={item.id} className="bg-white border rounded p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1 h-8 w-8"
                      title="Mover arriba"
                    >
                      <ArrowUp size={16} className={index === 0 ? "text-gray-300" : "text-gray-600"} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={index === fields.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1 h-8 w-8"
                      title="Mover abajo"
                    >
                      <ArrowDown size={16} className={index === fields.length - 1 ? "text-gray-300" : "text-gray-600"} />
                    </Button>
                  </div>
                  <Input
                    {...register(`items.${index}.label`, {
                      required: "El texto es obligatorio"
                    })}
                    placeholder="Texto del enlace"
                    className="flex-grow"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Destino</Label>
                    <Controller
                      name={`items.${index}.target`}
                      control={control}
                      rules={{ required: "Selecciona un destino" }}
                      render={({ field }) => (
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Si se elige personalizado, asegurarse de que haya una URL predeterminada
                            if (value === "custom" && !watch(`items.${index}.customUrl`)) {
                              setValue(`items.${index}.customUrl`, "https://");
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un destino" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Opciones de selección agrupadas por categoría */}
                            <div className="py-1 px-2 text-xs text-muted-foreground font-semibold bg-muted">
                              PÁGINAS DEL SISTEMA
                            </div>
                            <SelectItem value="home">Página de Inicio</SelectItem>
                            <SelectItem value="blog">Blog</SelectItem>
                            <SelectItem value="portfolio">Portfolio</SelectItem>
                            
                            {/* Páginas estáticas */}
                            {staticPages && staticPages.length > 0 && (
                              <>
                                <div className="py-1 px-2 text-xs text-muted-foreground font-semibold bg-muted mt-1">
                                  PÁGINAS ESTÁTICAS
                                </div>
                                {staticPages.map((page) => (
                                  <SelectItem key={page.id} value={`/page/${page.slug}`}>
                                    {page.title}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                            
                            {/* Opción para URL personalizada */}
                            <div className="py-1 px-2 text-xs text-muted-foreground font-semibold bg-muted mt-1">
                              OTRAS OPCIONES
                            </div>
                            <SelectItem value="custom">URL Personalizada</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.items?.[index]?.target && (
                      <p className="text-red-500 text-sm">{errors.items[index].target.message}</p>
                    )}
                  </div>

                  {watch(`items.${index}.target`) === "custom" && (
                    <div className="space-y-2">
                      <Label>URL personalizada</Label>
                      <Input
                        {...register(`items.${index}.customUrl`, {
                          required: watch(`items.${index}.target`) === "custom" ? "La URL es obligatoria" : false,
                        })}
                        placeholder="https://example.com"
                      />
                      {errors.items?.[index]?.customUrl && (
                        <p className="text-red-500 text-sm">{errors.items[index].customUrl.message}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Controller
                        name={`items.${index}.openInNewTab`}
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id={`items.${index}.openInNewTab`}
                            checked={field.value === true}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor={`items.${index}.openInNewTab`}>Abrir en pestaña nueva</Label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addMenuItem}
              className="w-full mt-2 flex items-center justify-center"
            >
              <Plus className="mr-2 h-4 w-4" /> Añadir elemento al menú
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || fields.length === 0}>
          {isSubmitting ? 'Guardando...' : 'Guardar Menú de Navegación'}
        </Button>
      </div>
    </form>
  );
}
