import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { logAdminAction } from "@/lib/stats";
import { updateGlobalConfig } from "@/lib/config-server";

/**
 * GET - Fetch security settings
 * Protected route: Only ADMIN and MASTER roles can access
 */
export async function GET() {
  try {
    // Check if the user is authorized (ADMIN or MASTER)
    const currentUserRole = await getCurrentUserRole();
    
    if (!currentUserRole || (currentUserRole !== Role.ADMIN && currentUserRole !== Role.MASTER)) {
      return NextResponse.json(
        { error: "No tienes permiso para acceder a esta información" },
        { status: 403 }
      );
    }

    // Get the global config
    const { getGlobalConfig } = await import("@/lib/config-server");
    const globalConfig = await getGlobalConfig();

    if (!globalConfig) {
      return NextResponse.json(
        { error: "No se pudo obtener la configuración global" },
        { status: 500 }
      );
    }

    // Extract security settings
    const securitySettings = {
      passwordMinLength: (globalConfig as any).passwordMinLength ?? 8,
      passwordRequireUppercase: (globalConfig as any).passwordRequireUppercase ?? true,
      passwordRequireNumber: (globalConfig as any).passwordRequireNumber ?? true,
      passwordRequireSymbol: (globalConfig as any).passwordRequireSymbol ?? true,
      sessionDuration: (globalConfig as any).sessionDuration ?? 24,
      maxLoginAttempts: (globalConfig as any).maxLoginAttempts ?? 5,
      captchaEnabled: (globalConfig as any).captchaEnabled ?? false,
      accountLockoutDuration: (globalConfig as any).accountLockoutDuration ?? 30,
    };

    return NextResponse.json(securitySettings);
  } catch (error) {
    console.error("Error fetching security settings:", error);
    return NextResponse.json(
      { error: "Error al obtener la configuración de seguridad" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update security settings
 * Protected route: Only ADMIN and MASTER roles can access
 */
export async function PUT(req: NextRequest) {
  try {
    // Check if the user is authorized (ADMIN or MASTER)
    const currentUserRole = await getCurrentUserRole();
    
    if (!currentUserRole || (currentUserRole !== Role.ADMIN && currentUserRole !== Role.MASTER)) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar esta configuración" },
        { status: 403 }
      );
    }

    // Get the current user's session ID for logging
    const { prisma } = await import("@/lib/prisma");
    const session = await prisma.session.findFirst({
      where: {
        expires: {
          gt: new Date(),
        },
      },
      orderBy: {
        expires: "desc",
      },
      select: {
        userId: true,
      },
    });

    if (!session?.userId) {
      return NextResponse.json(
        { error: "No se pudo identificar al usuario actual" },
        { status: 401 }
      );
    }

    // Parse request body
    const {
      passwordMinLength,
      passwordRequireUppercase,
      passwordRequireNumber,
      passwordRequireSymbol,
      sessionDuration,
      maxLoginAttempts,
      captchaEnabled,
      accountLockoutDuration,
    } = await req.json();

    // Validate fields
    const parsedPasswordMinLength = parseInt(passwordMinLength);
    const parsedSessionDuration = parseInt(sessionDuration);
    const parsedMaxLoginAttempts = parseInt(maxLoginAttempts);
    const parsedAccountLockoutDuration = parseInt(accountLockoutDuration);
    
    if (isNaN(parsedPasswordMinLength) || parsedPasswordMinLength < 1) {
      return NextResponse.json(
        { error: "La longitud mínima de la contraseña debe ser un número entero positivo" },
        { status: 400 }
      );
    }
    
    if (isNaN(parsedSessionDuration) || parsedSessionDuration < 1) {
      return NextResponse.json(
        { error: "La duración de la sesión debe ser un número entero positivo" },
        { status: 400 }
      );
    }
    
    if (isNaN(parsedMaxLoginAttempts) || parsedMaxLoginAttempts < 1) {
      return NextResponse.json(
        { error: "El número máximo de intentos de inicio de sesión debe ser un número entero positivo" },
        { status: 400 }
      );
    }
    
    if (isNaN(parsedAccountLockoutDuration) || parsedAccountLockoutDuration < 1) {
      return NextResponse.json(
        { error: "La duración del bloqueo de cuenta debe ser un número entero positivo" },
        { status: 400 }
      );
    }

    // Update security settings
    const securitySettings = {
      passwordMinLength: parsedPasswordMinLength,
      passwordRequireUppercase: Boolean(passwordRequireUppercase),
      passwordRequireNumber: Boolean(passwordRequireNumber),
      passwordRequireSymbol: Boolean(passwordRequireSymbol),
      sessionDuration: parsedSessionDuration,
      maxLoginAttempts: parsedMaxLoginAttempts,
      captchaEnabled: Boolean(captchaEnabled),
      accountLockoutDuration: parsedAccountLockoutDuration,
    };

    // Update global config
    const updatedConfig = await updateGlobalConfig(securitySettings);

    if (!updatedConfig) {
      return NextResponse.json(
        { error: "Error al actualizar la configuración de seguridad" },
        { status: 500 }
      );
    }

    // Log the action
    await logAdminAction(
      session.userId,
      "UPDATE_SECURITY_SETTINGS",
      `Security settings updated`
    );

    return NextResponse.json(securitySettings);
  } catch (error) {
    console.error("Error updating security settings:", error);
    return NextResponse.json(
      { error: "Error al actualizar la configuración de seguridad" },
      { status: 500 }
    );
  }
}
