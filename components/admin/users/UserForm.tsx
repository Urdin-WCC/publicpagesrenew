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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper function to check if the current user's role is higher than the target role
function hasHigherRole(currentRole: Role | null, targetRole: Role): boolean {
  if (!currentRole) return false;

  const roleValues: Record<Role, number> = {
    [Role.COLLABORATOR]: 1,
    [Role.EDITOR]: 2,
    [Role.ADMIN]: 3,
    [Role.MASTER]: 4,
  };

  return roleValues[currentRole] > roleValues[targetRole];
}

type User = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
};

type UserFormProps = {
  user?: User; // Optional for edit mode
  isEditMode?: boolean;
};

type FormValues = {
  name: string;
  email: string;
  password?: string; // Optional in edit mode
  role: Role;
};

export default function UserForm({ user, isEditMode = false }: UserFormProps) {
  const router = useRouter();
  const currentUserRole = useCurrentUserRole();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = 
    useForm<FormValues>({
      defaultValues: {
        name: user?.name || "",
        email: user?.email || "",
        role: user?.role || Role.COLLABORATOR,
      },
    });

  const selectedRole = watch("role");

  // Set up available roles based on current user's role
  useEffect(() => {
    if (!currentUserRole) return;

    // Define all roles
    const allRoles = [Role.COLLABORATOR, Role.EDITOR, Role.ADMIN, Role.MASTER];
    
    // Set available roles based on current user's role
    let filteredRoles: Role[];
    
    if (currentUserRole === Role.MASTER) {
      // MASTER users can assign any role, including MASTER
      filteredRoles = [...allRoles];
    } else {
      // Other users can only assign roles lower than their own
      filteredRoles = allRoles.filter(role => hasHigherRole(currentUserRole, role));
    }
    
    // For edit mode, also include the user's current role if it's equal to or higher than the current user's role
    // (this is just to show it in the dropdown, but it won't be selectable)
    if (isEditMode && user && currentUserRole && !hasHigherRole(currentUserRole, user.role) && user.role !== currentUserRole) {
      filteredRoles.push(user.role);
    }
    
    setAvailableRoles(filteredRoles);

    // Default to the highest role available if the current role cannot be set
    if (user && !hasHigherRole(currentUserRole, user.role)) {
      setValue("role", filteredRoles[0]);
    }
  }, [currentUserRole, user, isEditMode, setValue]);

  // Function to handle form submit
  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Validate that the selected role is allowed
      if (currentUserRole !== Role.MASTER && !hasHigherRole(currentUserRole, data.role)) {
        throw new Error("No tienes permiso para asignar este rol");
      }

      // Create or update user
      const url = isEditMode ? `/api/users/${user?.id}` : "/api/users";
      const method = isEditMode ? "PUT" : "POST";
      
      // For edit mode, omit password if it's empty
      const body = isEditMode && !data.password 
        ? { name: data.name, email: data.email, role: data.role }
        : data;
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Error al procesar la solicitud");
      }
      
      setSuccess(isEditMode 
        ? "Usuario actualizado correctamente" 
        : "Usuario creado correctamente"
      );
      
      // Redirect to users list after a short delay
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  // Function to format role for display
  const formatRole = (role: Role): string => {
    const roleDisplay: Record<Role, string> = {
      [Role.MASTER]: "Maestro",
      [Role.ADMIN]: "Administrador",
      [Role.EDITOR]: "Editor",
      [Role.COLLABORATOR]: "Colaborador",
    };
    return roleDisplay[role] || role;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditMode ? "Editar Usuario" : "Nuevo Usuario"}</CardTitle>
        <CardDescription>
          {isEditMode 
            ? "Actualiza la información del usuario" 
            : "Crea un nuevo usuario en el sistema"
          }
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
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
              {...register("name", { required: "El nombre es obligatorio" })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { 
                required: "El correo electrónico es obligatorio",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Ingresa un correo electrónico válido",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">
              {isEditMode ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password", { 
                required: !isEditMode ? "La contraseña es obligatoria" : false,
                minLength: {
                  value: 8,
                  message: "La contraseña debe tener al menos 8 caracteres"
                },
                pattern: isEditMode ? undefined : {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
                  message: "La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un símbolo"
                }
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select 
              value={selectedRole}
              onValueChange={(value) => setValue("role", value as Role)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem 
                    key={role} 
                    value={role}
      // Only disable roles that are higher than the current user's role
      // MASTER users can assign any role, even to other MASTER users
      disabled={currentUserRole !== Role.MASTER && !hasHigherRole(currentUserRole, role)}
                  >
                    {formatRole(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-red-500 text-sm">{errors.role.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push("/admin/users")}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || success !== ""}>
            {loading 
              ? "Guardando..." 
              : isEditMode ? "Actualizar Usuario" : "Crear Usuario"
            }
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
