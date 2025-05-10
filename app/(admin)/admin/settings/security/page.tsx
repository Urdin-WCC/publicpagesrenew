"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useCurrentUserRole } from "@/lib/auth";
import { Role } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Define the form values type
type SecurityFormValues = {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSymbol: boolean;
  sessionDuration: number;
  maxLoginAttempts: number;
  captchaEnabled: boolean;
  accountLockoutDuration: number;
};

export default function SecuritySettingsPage() {
  const router = useRouter();
  const currentUserRole = useCurrentUserRole();
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Set up the form
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SecurityFormValues>();

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await fetch("/api/settings/security");
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Error al obtener la configuración de seguridad");
        }
        
        const settings = await response.json();
        
        // Set form values
        setValue("passwordMinLength", settings.passwordMinLength || 8);
        setValue("passwordRequireUppercase", settings.passwordRequireUppercase === true);
        setValue("passwordRequireNumber", settings.passwordRequireNumber === true);
        setValue("passwordRequireSymbol", settings.passwordRequireSymbol === true);
        setValue("sessionDuration", settings.sessionDuration || 24);
        setValue("maxLoginAttempts", settings.maxLoginAttempts || 5);
        setValue("captchaEnabled", settings.captchaEnabled === true);
        setValue("accountLockoutDuration", settings.accountLockoutDuration || 30);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error al obtener la configuración de seguridad");
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if we have a valid role
    if (currentUserRole === Role.ADMIN || currentUserRole === Role.MASTER) {
      fetchSettings();
    }
  }, [currentUserRole, setValue]);

  // Check if user has the required role (ADMIN or MASTER)
  useEffect(() => {
    if (currentUserRole === null) {
      // Role is still loading, do nothing
      return;
    }
    
    if (currentUserRole !== Role.ADMIN && currentUserRole !== Role.MASTER) {
      // Redirect unauthorized users
      router.push("/unauthorized");
    }
  }, [currentUserRole, router]);

  // Submit form
  const onSubmit = async (data: SecurityFormValues) => {
    setFormSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch("/api/settings/security", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar la configuración de seguridad");
      }
      
      setSuccess("Configuración de seguridad actualizada correctamente");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al actualizar la configuración de seguridad");
    } finally {
      setFormSubmitting(false);
    }
  };

  // If role is still loading or user is not authorized, show loading state
  if (currentUserRole === null || (currentUserRole !== Role.ADMIN && currentUserRole !== Role.MASTER)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Configuración de Seguridad</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Seguridad del Sistema</CardTitle>
            <CardDescription>
              Configura los parámetros de seguridad para todo el sitio
            </CardDescription>
          </CardHeader>
          
          {loading ? (
            <CardContent className="flex justify-center py-6">
              <p>Cargando configuración...</p>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}
                
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Requisitos de Contraseña</h3>
                  <p className="text-sm text-gray-500">
                    Define los requisitos mínimos para todas las contraseñas del sistema
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passwordMinLength">Longitud Mínima</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        min="6"
                        {...register("passwordMinLength", {
                          required: "Este campo es obligatorio",
                          min: { value: 6, message: "El valor mínimo es 6" },
                          valueAsNumber: true,
                        })}
                      />
                      {errors.passwordMinLength && (
                        <p className="text-red-500 text-sm">{errors.passwordMinLength.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sessionDuration">Duración de Sesión (horas)</Label>
                      <Input
                        id="sessionDuration"
                        type="number"
                        min="1"
                        {...register("sessionDuration", {
                          required: "Este campo es obligatorio",
                          min: { value: 1, message: "El valor mínimo es 1" },
                          valueAsNumber: true,
                        })}
                      />
                      {errors.sessionDuration && (
                        <p className="text-red-500 text-sm">{errors.sessionDuration.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="passwordRequireUppercase">Requerir Letra Mayúscula</Label>
                      <p className="text-sm text-gray-500">
                        La contraseña debe contener al menos una letra mayúscula
                      </p>
                    </div>
                    <Switch
                      id="passwordRequireUppercase"
                      {...register("passwordRequireUppercase")}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="passwordRequireNumber">Requerir Número</Label>
                      <p className="text-sm text-gray-500">
                        La contraseña debe contener al menos un número
                      </p>
                    </div>
                    <Switch
                      id="passwordRequireNumber"
                      {...register("passwordRequireNumber")}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="passwordRequireSymbol">Requerir Símbolo</Label>
                      <p className="text-sm text-gray-500">
                        La contraseña debe contener al menos un símbolo especial
                      </p>
                    </div>
                    <Switch
                      id="passwordRequireSymbol"
                      {...register("passwordRequireSymbol")}
                    />
                  </div>
                </div>
                
                <div className="space-y-1 pt-4 border-t">
                  <h3 className="text-lg font-medium">Protección contra Ataques</h3>
                  <p className="text-sm text-gray-500">
                    Configura la protección contra intentos de acceso no autorizados
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">Intentos Máximos de Inicio de Sesión</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        min="1"
                        {...register("maxLoginAttempts", {
                          required: "Este campo es obligatorio",
                          min: { value: 1, message: "El valor mínimo es 1" },
                          valueAsNumber: true,
                        })}
                      />
                      {errors.maxLoginAttempts && (
                        <p className="text-red-500 text-sm">{errors.maxLoginAttempts.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="accountLockoutDuration">Duración del Bloqueo (minutos)</Label>
                      <Input
                        id="accountLockoutDuration"
                        type="number"
                        min="1"
                        {...register("accountLockoutDuration", {
                          required: "Este campo es obligatorio",
                          min: { value: 1, message: "El valor mínimo es 1" },
                          valueAsNumber: true,
                        })}
                      />
                      {errors.accountLockoutDuration && (
                        <p className="text-red-500 text-sm">{errors.accountLockoutDuration.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="captchaEnabled">Habilitar CAPTCHA</Label>
                      <p className="text-sm text-gray-500">
                        Mostrar CAPTCHA en la página de inicio de sesión
                      </p>
                    </div>
                    <Switch
                      id="captchaEnabled"
                      {...register("captchaEnabled")}
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" disabled={formSubmitting}>
                  {formSubmitting ? "Guardando..." : "Guardar Configuración"}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
