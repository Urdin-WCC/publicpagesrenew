"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ProfileFormValues = {
  name: string;
  email: string;
}

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // Profile form
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = 
    useForm<ProfileFormValues>({
      defaultValues: {
        name: session?.user?.name || "",
        email: session?.user?.email || "",
      },
    });

  // Password form
  const { 
    register: registerPassword, 
    handleSubmit: handleSubmitPassword, 
    formState: { errors: passwordErrors },
    watch,
    reset: resetPasswordForm
  } = useForm<PasswordFormValues>();

  const newPassword = watch("newPassword");

  // Function to update profile
  const onSubmitProfile = async (data: ProfileFormValues) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar el perfil");
      }
      
      setSuccess("Perfil actualizado correctamente");
      
      // Update session data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: result.name,
          email: result.email,
        },
      });
      
      // Reload the page
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  // Function to update password
  const onSubmitPassword = async (data: PasswordFormValues) => {
    setLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    
    try {
      const response = await fetch("/api/users/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Error al cambiar la contraseña");
      }
      
      setPasswordSuccess("Contraseña actualizada correctamente");
      resetPasswordForm();
      setIsPasswordDialogOpen(false);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  // If session is loading, show loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Mi Perfil</h1>
        
        {/* Profile Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Información de Perfil</CardTitle>
            <CardDescription>Actualiza tu información personal</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
            <CardContent className="space-y-4">
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
              
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  {...registerProfile("name", { required: "El nombre es obligatorio" })}
                />
                {profileErrors.name && (
                  <p className="text-red-500 text-sm">{profileErrors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  {...registerProfile("email", { 
                    required: "El correo electrónico es obligatorio",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Ingresa un correo electrónico válido",
                    },
                  })}
                />
                {profileErrors.email && (
                  <p className="text-red-500 text-sm">{profileErrors.email.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar Perfil"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Password Change Section */}
        <Card>
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsPasswordDialogOpen(true)}>
              Cambiar Contraseña
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
            <DialogHeader>
              <DialogTitle>Cambiar Contraseña</DialogTitle>
              <DialogDescription>
                Actualiza tu contraseña de acceso. Por seguridad, deberás ingresar tu contraseña actual.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              {passwordError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                  {passwordError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...registerPassword("currentPassword", { 
                    required: "La contraseña actual es obligatoria" 
                  })}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-sm">{passwordErrors.currentPassword.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...registerPassword("newPassword", { 
                    required: "La nueva contraseña es obligatoria",
                    minLength: {
                      value: 8,
                      message: "La contraseña debe tener al menos 8 caracteres"
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message: "La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un símbolo"
                    }
                  })}
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-sm">{passwordErrors.newPassword.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...registerPassword("confirmPassword", { 
                    required: "La confirmación de contraseña es obligatoria",
                    validate: value => value === newPassword || "Las contraseñas no coinciden"
                  })}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-sm">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsPasswordDialogOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Actualizando..." : "Cambiar Contraseña"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
