// Script para verificar y corregir el formato del menú de navegación
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Verificando formato del menú de navegación...");
    
    // Obtener el valor actual
    const result = await prisma.$queryRaw`
      SELECT navigationMenu 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!result || !result.length || !result[0].navigationMenu) {
      console.log("No hay datos de menú o la columna navigationMenu está vacía.");
      return;
    }
    
    const currentMenu = result[0].navigationMenu;
    console.log("Valor actual del menú:");
    console.log(currentMenu);
    
    // Intentar parsear el JSON actual
    try {
      const parsedMenu = JSON.parse(currentMenu);
      console.log("\nEl JSON se puede parsear por JavaScript, pero verificaremos su formato...");
      console.log("Contenido parseado:", parsedMenu);
      
      // Verificar si es un array
      if (!Array.isArray(parsedMenu)) {
        throw new Error("El menú debe ser un array");
      }
      
      // Verificar que cada elemento tiene los campos requeridos
      parsedMenu.forEach((item, index) => {
        const requiredFields = ['id', 'label', 'target'];
        requiredFields.forEach(field => {
          if (!(field in item)) {
            throw new Error(`Falta el campo ${field} en el elemento ${index}`);
          }
        });
      });
      
      // Verificar formato visual para asegurarnos de que tiene comas entre campos
      if (currentMenu.includes('""') || !currentMenu.includes('","')) {
        console.log("\n⚠️ Aunque el JSON puede ser parseado, su formato no es estándar.");
        throw new Error("Formato JSON no estándar, procediendo a corregirlo.");
      }
      
      console.log("\n✅ El menú de navegación tiene un formato correcto y estándar.");
      return;
    } catch (parseError) {
      console.error("\n❌ Error al parsear el JSON:", parseError.message);
      console.log("Intentando corregir el formato...");
      
      // Aquí intentamos reconstruir un JSON correcto
      try {
        // Mejor que usar regex, vamos a parsear y reconstruir correctamente
        const parsedMenu = JSON.parse(currentMenu);
        
        // Crear un nuevo JSON correctamente formateado
        const fixedJson = JSON.stringify(parsedMenu);
        console.log("\nJSON correctamente formateado:");
        console.log(JSON.stringify(JSON.parse(fixedJson), null, 2));
        
        // Guardar el JSON correctamente formateado
        console.log("\nGuardando el JSON correctamente formateado en la base de datos...");
        await prisma.$executeRawUnsafe(`
          UPDATE GlobalConfig
          SET navigationMenu = '${fixedJson.replace(/'/g, "''")}'
          WHERE id = 'global'
        `);
        
        console.log("✅ Menú de navegación corregido y guardado exitosamente.");
      } catch (fixError) {
        console.error("Error al intentar corregir el JSON:", fixError);
        
        // Si fallamos en arreglar automáticamente, creemos un menú vacío nuevo
        console.log("\nCreando un nuevo menú vacío...");
        const emptyMenu = JSON.stringify([]);
        await prisma.$executeRawUnsafe(`
          UPDATE GlobalConfig
          SET navigationMenu = '${emptyMenu}'
          WHERE id = 'global'
        `);
        
        console.log("✅ Se ha creado un nuevo menú vacío. Puedes agregar elementos desde la interfaz de administración.");
      }
    }
  } catch (error) {
    console.error("Error general:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
