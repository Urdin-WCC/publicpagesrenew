import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { logAdminAction } from "@/lib/stats";
import { hashSync } from "bcrypt";

// Function to hash a password
function hashPassword(password: string): string {
  return hashSync(password, 10);
}

/**
 * PUT - Reset a user's password
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
        { error: "No tienes permiso para restablecer contraseñas" },
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

    // MASTER users can reset passwords for any user, others only for users with lower roles
    if (currentUserRole !== Role.MASTER && targetRoleValue >= currentRoleValue) {
      return NextResponse.json(
        { error: "No tienes permiso para restablecer la contraseña de este usuario" },
        { status: 403 }
      );
    }

    // Parse request body
    const { password } = await req.json();

    // Validate required fields
    if (!password) {
      return NextResponse.json(
        { error: "La contraseña es obligatoria" },
        { status: 400 }
      );
    }

    // Get the global config to check password requirements
    const globalConfig = await prisma.globalConfig.findUnique({
      where: { id: 'global' },
    });

    // Default password requirements if config not found
    // Using type casting as a workaround until Prisma schema is updated
    const passwordMinLength = (globalConfig as any)?.passwordMinLength ?? 8;
    const passwordRequireUppercase = (globalConfig as any)?.passwordRequireUppercase ?? true;
    const passwordRequireNumber = (globalConfig as any)?.passwordRequireNumber ?? true;
    const passwordRequireSymbol = (globalConfig as any)?.passwordRequireSymbol ?? true;

    // Validate password against requirements
    if (password.length < passwordMinLength) {
      return NextResponse.json(
        { error: `La contraseña debe tener al menos ${passwordMinLength} caracteres` },
        { status: 400 }
      );
    }

    if (passwordRequireUppercase && !/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos una letra mayúscula" },
        { status: 400 }
      );
    }

    if (passwordRequireNumber && !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos un número" },
        { status: 400 }
      );
    }

    if (passwordRequireSymbol && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos un símbolo" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = hashPassword(password);

    // Update the user's password
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    // Log the admin action
    await logAdminAction(
      currentUserId,
      "RESET_PASSWORD",
      `Password reset for user: ${targetUser.id} (${targetUser.email})`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error resetting password for user ${context.params.id}:`, error);
    return NextResponse.json(
      { error: "Error al restablecer la contraseña" },
      { status: 500 }
    );
  }
}
