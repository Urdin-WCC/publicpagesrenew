import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validar los datos de entrada básicos
    if (!data.name) {
      return NextResponse.json(
        { error: "El nombre del tema es obligatorio" },
        { status: 400 }
      );
    }
    
    // Añadir una marca de borrador al nombre para identificarlo
    let draftName = data.name;
    if (!draftName.includes("[Borrador]")) {
      draftName = `${draftName} [Borrador]`;
    }
    
    // Asegurarse de que hay una configuración básica
    const config = data.config || { 
      background: { type: 'color', value: '#ffffff' }
    };
    
    // Crear el tema en borrador usando una consulta SQL directa
    const draftThemeResult = await prisma.$queryRaw`
      INSERT INTO ThemePreset (name, config)
      VALUES (${draftName}, ${JSON.stringify(config)})
      RETURNING id, name
    `;
    
    // Convertir el resultado de la consulta al formato esperado
    const draftTheme = Array.isArray(draftThemeResult) && draftThemeResult.length > 0 
      ? draftThemeResult[0] 
      : { id: 0, name: draftName };
    
    // Devolver el ID y nombre para poder usarlo en el formulario
    return NextResponse.json({
      id: draftTheme.id || 0,
      name: draftTheme.name || draftName
    });
  } catch (error) {
    console.error("Error creando tema en borrador:", error);
    return NextResponse.json(
      { error: "Error al crear el tema en borrador" },
      { status: 500 }
    );
  }
}
