import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { logAdminAction } from "@/lib/stats";

/**
 * GET - Fetch a single user by ID
 * Protected route: Only ADMIN and MASTER roles can access
 */
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // First await the context.params object
    const params = await Promise.resolve(context.params);
    const id = params.id;

    // Check if the user is authorized (ADMIN or MASTER)
    const currentUserRole = await getCurrentUserRole();
    
    if (!currentUserRole || (currentUserRole !== Role.ADMIN && currentUserRole !== Role.MASTER)) {
      return NextResponse.json(
        { error: "No tienes permiso para acceder a esta información" },
        { status: 403 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Check if the current user's role is higher than the target user's role
    const roleValues: Record<Role, number> = {
      [Role.COLLABORATOR]: 1,
      [Role.EDITOR]: 2,
      [Role.ADMIN]: 3,
      [Role.MASTER]: 4,
    };

    const targetRoleValue = roleValues[user.role] || 0;
    const currentRoleValue = roleValues[currentUserRole] || 0;

    // Get the current user from auth to check if it's their own profile
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No se pudo identificar al usuario actual" },
        { status: 401 }
      );
    }
    
    const currentUserId = session.user.id;

    // MASTER users can access any user, others can only access their own profile or users with lower roles
    if (currentUserRole !== Role.MASTER && currentUserId !== id && targetRoleValue >= currentRoleValue) {
      return NextResponse.json(
        { error: "No tienes permiso para acceder a este usuario" },
        { status: 403 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(`Error fetching user ${context.params.id}:`, error);
    return NextResponse.json(
      { error: "Error al obtener el usuario" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a user by ID
 * Protected route: Only ADMIN and MASTER roles can access
 */
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // First await the context.params object
    const params = await Promise.resolve(context.params);
    const id = params.id;

    // Check if the user is authorized (ADMIN or MASTER)
    const currentUserRole = await getCurrentUserRole();
    
    if (!currentUserRole || (currentUserRole !== Role.ADMIN && currentUserRole !== Role.MASTER)) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar usuarios" },
        { status: 403 }
      );
    }

    // Get the current user from auth
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No se pudo identificar al usuario actual" },
        { status: 401 }
      );
    }
    
    const currentUserId = session.user.id;

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Role hierarchy
    const roleValues: Record<Role, number> = {
      [Role.COLLABORATOR]: 1,
      [Role.EDITOR]: 2,
      [Role.ADMIN]: 3,
      [Role.MASTER]: 4,
    };

    const targetRoleValue = roleValues[targetUser.role] || 0;
    const currentRoleValue = roleValues[currentUserRole] || 0;

    // Users can edit their own profile, MASTER can edit any user, others only lower roles
    if (currentUserId === id) {
      // Allow users to edit their own profile
    } else if (currentUserRole !== Role.MASTER && targetRoleValue >= currentRoleValue) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar este usuario" },
        { status: 403 }
      );
    }

    // Parse request body
    const { name, email, role } = await req.json();

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    // Check if email already exists (and it's not the current user's email)
    if (email !== targetUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "El correo electrónico ya está en uso" },
          { status: 400 }
        );
      }
    }

    // Validate the requested role
    const requestedRoleValue = roleValues[role as Role] || 0;

    // MASTER users can assign MASTER role, but other roles must assign lower roles
    if (currentUserRole !== Role.MASTER && requestedRoleValue >= currentRoleValue) {
      return NextResponse.json(
        { error: "No puedes asignar un rol igual o superior al tuyo" },
        { status: 403 }
      );
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role: role as Role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    // Log the admin action
    await logAdminAction(
      currentUserId,
      "UPDATE_USER",
      `User updated: ${updatedUser.id} (${updatedUser.email}) with role ${updatedUser.role}`
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`Error updating user ${context.params.id}:`, error);
    return NextResponse.json(
      { error: "Error al actualizar el usuario" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a user by ID
 * Protected route: Only ADMIN and MASTER roles can access
 */
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // First await the context.params object
    const params = await Promise.resolve(context.params);
    const id = params.id;

    // Check if the user is authorized (ADMIN or MASTER)
    const currentUserRole = await getCurrentUserRole();
    
    if (!currentUserRole || (currentUserRole !== Role.ADMIN && currentUserRole !== Role.MASTER)) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar usuarios" },
        { status: 403 }
      );
    }

    // Get the current user from auth
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No se pudo identificar al usuario actual" },
        { status: 401 }
      );
    }
    
    const currentUserId = session.user.id;

    // Check if the user is trying to delete themselves
    if (currentUserId === id) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta" },
        { status: 403 }
      );
    }

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Role hierarchy
    const roleValues: Record<Role, number> = {
      [Role.COLLABORATOR]: 1,
      [Role.EDITOR]: 2,
      [Role.ADMIN]: 3,
      [Role.MASTER]: 4,
    };

    const targetRoleValue = roleValues[targetUser.role] || 0;
    const currentRoleValue = roleValues[currentUserRole] || 0;

    // MASTER users can delete any user except themselves, others can only delete users with lower roles
    if (currentUserRole !== Role.MASTER && targetRoleValue >= currentRoleValue) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este usuario" },
        { status: 403 }
      );
    }

    // Delete the user
    await prisma.user.delete({
      where: { id },
    });

    // Log the admin action
    await logAdminAction(
      currentUserId,
      "DELETE_USER",
      `User deleted: ${targetUser.id} (${targetUser.email}) with role ${targetUser.role}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting user ${context.params.id}:`, error);
    return NextResponse.json(
      { error: "Error al eliminar el usuario" },
      { status: 500 }
    );
  }
}
