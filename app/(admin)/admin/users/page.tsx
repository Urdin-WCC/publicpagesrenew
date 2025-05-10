"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCurrentUserRole } from "@/lib/auth";
import { Role } from "@/lib/auth-client";
import UserList from "@/components/admin/users/UserList";

export default function UsersPage() {
  const router = useRouter();
  const currentUserRole = useCurrentUserRole();
  
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button asChild>
          <Link href="/admin/users/new">
            Nuevo Usuario
          </Link>
        </Button>
      </div>
      
      <UserList />
    </div>
  );
}
