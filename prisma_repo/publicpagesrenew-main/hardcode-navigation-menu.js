// Script para crear un menu de navegación con formato correcto garantizado
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Creando menú de navegación con formato garantizado...");
    
    // Obtener elementos actuales para preservar los datos
    const result = await prisma.$queryRaw`
      SELECT navigationMenu 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    // Intentar extraer los datos actuales
    let items = [];
    if (result && result.length && result[0].navigationMenu) {
      try {
        const current = JSON.parse(result[0].navigationMenu);
        if (Array.isArray(current)) {
          items = current;
        }
      } catch (e) {
        console.error("Error al parsear el menú actual:", e);
      }
    }
    
    // Generar manualmente un string JSON con formato garantizado
    let jsonString;
    
    if (items.length > 0) {
      // Construir string JSON manualmente (con comas explícitas)
      jsonString = '[';
      
      items.forEach((item, index) => {
        jsonString += '{';
        jsonString += `"id":"${item.id || `menu-item-${Date.now()}`}",`;
        jsonString += `"label":"${item.label || 'Sin título'}",`;
        jsonString += `"target":"${item.target || 'home'}",`;
        jsonString += `"customUrl":"${item.customUrl || ''}",`;
        jsonString += `"openInNewTab":${item.openInNewTab ? 'true' : 'false'}`;
        jsonString += '}';
        
        // Añadir coma entre elementos (excepto el último)
        if (index < items.length - 1) {
          jsonString += ',';
        }
      });
      
      jsonString += ']';
    } else {
      // Menú por defecto
      jsonString = '[{"id":"menu-item-default1","label":"Inicio","target":"home","customUrl":"","openInNewTab":false},{"id":"menu-item-default2","label":"Blog","target":"blog","customUrl":"","openInNewTab":false}]';
    }
    
    console.log("JSON generado manualmente (con comas explícitas):");
    console.log(jsonString);
    
    // Verificar que es un JSON válido parseándolo
    try {
      const parsedItems = JSON.parse(jsonString);
      console.log("\n✅ El JSON generado es válido y contiene estos elementos:");
      parsedItems.forEach((item, i) => {
        console.log(`${i+1}. ${item.label} (${item.target})`);
      });
    } catch (error) {
      console.error("\n❌ Error: El JSON generado no es válido:", error);
      return;
    }
    
    // Guardar en la base de datos
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig 
      SET navigationMenu = '${jsonString.replace(/'/g, "''")}'
      WHERE id = 'global'
    `);
    
    console.log("\n✅ Menú guardado exitosamente con formato manual garantizado.");
    
  } catch (error) {
    console.error("Error general:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
