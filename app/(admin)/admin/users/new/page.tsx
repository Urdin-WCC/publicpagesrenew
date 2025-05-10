"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUserRole } from "@/lib/auth";
import { Role } from "@/lib/auth-client";
import UserForm from "@/components/admin/users/UserForm";

export default function NewUserPage() {
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
      <h1 className="text-2xl font-bold mb-8">Crear Nuevo Usuario</h1>
      <div className="max-w-2xl mx-auto">
        <UserForm />
      </div>
    </div>
  );
}
