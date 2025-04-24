import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAdminAction } from "@/lib/stats";
import { compareSync, hashSync } from "bcrypt";

/**
 * PUT - Change the current user's password
 * Protected route: Logged in users can access
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse request body
    const { currentPassword, newPassword } = await req.json();

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "La contraseña actual y la nueva son obligatorias" },
        { status: 400 }
      );
    }

    // Get the user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = compareSync(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "La contraseña actual no es correcta" },
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
    if (newPassword.length < passwordMinLength) {
      return NextResponse.json(
        { error: `La contraseña debe tener al menos ${passwordMinLength} caracteres` },
        { status: 400 }
      );
    }

    if (passwordRequireUppercase && !/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos una letra mayúscula" },
        { status: 400 }
      );
    }

    if (passwordRequireNumber && !/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos un número" },
        { status: 400 }
      );
    }

    if (passwordRequireSymbol && !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos un símbolo" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = hashSync(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // Log the action
    await logAdminAction(
      userId,
      "CHANGE_PASSWORD",
      `Password changed for user: ${userId} (${user.email})`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Error al cambiar la contraseña" },
      { status: 500 }
    );
  }
}
