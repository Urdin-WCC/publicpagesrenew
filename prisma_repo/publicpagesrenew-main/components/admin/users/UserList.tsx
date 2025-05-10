"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUserRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  createdAt: string;
  updatedAt: string;
};

export default function UserList() {
  const router = useRouter();
  const currentUserRole = useCurrentUserRole();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

  // Function to format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch("/api/users");
        
        if (!response.ok) {
          throw new Error("Error al obtener usuarios");
        }
        
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error al obtener usuarios");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Function to delete user
  const handleDelete = async () => {
    if (!deleteUserId) return;
    
    setIsDeleting(true);
    setDeleteError("");
    
    try {
      const response = await fetch(`/api/users/${deleteUserId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar usuario");
      }
      
      // Remove the deleted user from the state
      setUsers(users.filter(user => user.id !== deleteUserId));
      setIsDeleteDialogOpen(false);
      setDeleteUserId(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Error al eliminar usuario");
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to open delete dialog
  const confirmDelete = (userId: string) => {
    setDeleteUserId(userId);
    setIsDeleteDialogOpen(true);
    setDeleteError("");
  };

  // If loading, show loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo Electrónico</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No hay usuarios
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || "Sin nombre"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatRole(user.role)}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="space-x-2">
                    {(currentUserRole === Role.MASTER || hasHigherRole(currentUserRole, user.role)) && (
                      <>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/users/edit/${user.id}`}>
                            Editar
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => confirmDelete(user.id)}
                        >
                          Eliminar
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          {deleteError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm mb-4">
              {deleteError}
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isDeleting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
