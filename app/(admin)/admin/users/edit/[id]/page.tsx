"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCurrentUserRole } from "@/lib/auth";
import { Role } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UserForm from "@/components/admin/users/UserForm";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const currentUserRole = useCurrentUserRole();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  // Get ID safely from useParams hook
  const userId = typeof params?.id === 'string' ? params.id : null;

  // Fetch user data when userId is available
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      setLoading(true);
      
      try {
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Error al obtener datos del usuario");
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error al obtener datos del usuario");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a valid role and userId
    if ((currentUserRole === Role.ADMIN || currentUserRole === Role.MASTER) && userId) {
      fetchUser();
    }
  }, [userId, currentUserRole]);

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

  // Function to reset password
  const handleResetPassword = async () => {
    if (!resetPassword) {
      setResetError("La nueva contraseña es obligatoria");
      return;
    }

    setIsResetting(true);
    setResetError("");
    setResetSuccess("");
    
    try {
      if (!userId) {
        throw new Error("ID de usuario no disponible");
      }
      
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: resetPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error al restablecer la contraseña");
      }
      
      setResetSuccess("Contraseña restablecida correctamente");
      setResetPassword("");
      
      // Close dialog after a short delay
      setTimeout(() => {
        setIsPasswordDialogOpen(false);
        setResetSuccess("");
      }, 2000);
    } catch (error) {
      setResetError(error instanceof Error ? error.message : "Error al restablecer la contraseña");
    } finally {
      setIsResetting(false);
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

  // If loading, show loading indicator
  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-40">
          <p>Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Button
          onClick={() => router.push("/admin/users")}
          className="mt-4"
        >
          Volver a la lista de usuarios
        </Button>
      </div>
    );
  }

  // If user is not found (should not happen after successful fetch)
  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Usuario no encontrado
        </div>
        <Button
          onClick={() => router.push("/admin/users")}
          className="mt-4"
        >
          Volver a la lista de usuarios
        </Button>
      </div>
    );
  }

  // Check if the current user has permission to edit this user
  const hasPermission = (() => {
    // Always allow editing your own profile
    if (userId === user.id) {
      return true;
    }

    // Role-based permission check
    const roleValues: Record<Role, number> = {
      [Role.COLLABORATOR]: 1,
      [Role.EDITOR]: 2,
      [Role.ADMIN]: 3,
      [Role.MASTER]: 4,
    };
    
    const myRoleValue = roleValues[currentUserRole || Role.COLLABORATOR];
    const targetRoleValue = roleValues[user.role];
    
    // MASTER can edit any user, others only lower roles
    return currentUserRole === Role.MASTER || myRoleValue > targetRoleValue;
  })();

  if (!hasPermission) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          No tienes permiso para editar este usuario
        </div>
        <Button
          onClick={() => router.push("/admin/users")}
          className="mt-4"
        >
          Volver a la lista de usuarios
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Editar Usuario</h1>
          <Button 
            variant="outline"
            onClick={() => setIsPasswordDialogOpen(true)}
          >
            Restablecer Contraseña
          </Button>
        </div>
        
        <UserForm user={user} isEditMode />
      </div>
      
      {/* Password Reset Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Restablecer Contraseña</DialogTitle>
            <DialogDescription>
              Establece una nueva contraseña para este usuario. La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, un número y un símbolo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {resetError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm mb-4">
                {resetError}
              </div>
            )}
            
            {resetSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm mb-4">
                {resetSuccess}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="resetPassword" className="text-sm font-medium">
                Nueva Contraseña
              </label>
              <input
                id="resetPassword"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Ingresa la nueva contraseña"
              />
              <p className="text-xs text-gray-500">
                La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, un número y un símbolo.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
              disabled={isResetting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleResetPassword}
              disabled={isResetting || resetSuccess !== ""}
            >
              {isResetting ? "Restableciendo..." : "Restablecer Contraseña"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
