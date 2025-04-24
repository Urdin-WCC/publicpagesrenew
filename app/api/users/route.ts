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
 * GET - Fetch all users
 * Protected route: Only ADMIN and MASTER roles can access
 */
export async function GET(req: NextRequest) {
  try {
    // Check if the user is authorized (ADMIN or MASTER)
    const currentUserRole = await getCurrentUserRole();
    
    if (!currentUserRole || (currentUserRole !== Role.ADMIN && currentUserRole !== Role.MASTER)) {
      return NextResponse.json(
        { error: "No tienes permiso para acceder a esta información" },
        { status: 403 }
      );
    }

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new user
 * Protected route: Only ADMIN and MASTER roles can access
 */
export async function POST(req: NextRequest) {
  try {
    // Check if the user is authorized (ADMIN or MASTER)
    const currentUserRole = await getCurrentUserRole();
    
    if (!currentUserRole || (currentUserRole !== Role.ADMIN && currentUserRole !== Role.MASTER)) {
      return NextResponse.json(
        { error: "No tienes permiso para crear usuarios" },
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

    // Parse request body
    const { name, email, password, role } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    // Validate role hierarchy
    const roleValues: Record<Role, number> = {
      [Role.COLLABORATOR]: 1,
      [Role.EDITOR]: 2,
      [Role.ADMIN]: 3,
      [Role.MASTER]: 4,
    };

    const requestedRoleValue = roleValues[role as Role] || 0;
    const currentRoleValue = roleValues[currentUserRole] || 0;

    // MASTER users can create other MASTER users, but other roles must create lower roles
    if (currentUserRole !== Role.MASTER && requestedRoleValue >= currentRoleValue) {
      return NextResponse.json(
        { error: "No puedes crear un usuario con un rol igual o superior al tuyo" },
        { status: 403 }
      );
    }

    // Check if the email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está en uso" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = hashPassword(password);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
      },
    });

    // Log the admin action
    await logAdminAction(
      currentUserId,
      "CREATE_USER",
      `User created: ${newUser.id} (${newUser.email}) with role ${newUser.role}`
    );

    // Return the newly created user (excluding the password)
    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    );
  }
}
