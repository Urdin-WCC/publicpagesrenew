// Script para resetear el menú de navegación con un formato correcto
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Reseteando el menú de navegación...");
    
    // Obtener el valor actual para referencia
    const result = await prisma.$queryRaw`
      SELECT navigationMenu 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (result && result.length && result[0].navigationMenu) {
      console.log("Valor actual del menú:");
      console.log(result[0].navigationMenu);
      
      // Intentar parsear para preservar los elementos
      try {
        const currentItems = JSON.parse(result[0].navigationMenu);
        
        // Crear un nuevo array con los mismos datos
        const newMenu = currentItems.map(item => ({
          id: item.id || `menu-item-${Date.now()}`,
          label: item.label || "Elemento",
          target: item.target || "home",
          customUrl: item.customUrl || "",
          openInNewTab: !!item.openInNewTab
        }));
        
        // Convertir a JSON con formato correcto
        const newMenuJson = JSON.stringify(newMenu);
        
        // Guardar el nuevo menú
        await prisma.$executeRawUnsafe(`
          UPDATE GlobalConfig
          SET navigationMenu = '${newMenuJson.replace(/'/g, "''")}'
          WHERE id = 'global'
        `);
        
        console.log("\nNuevo menú guardado exitosamente:");
        console.log(JSON.stringify(JSON.parse(newMenuJson), null, 2));
      } catch (parseError) {
        console.error("Error al parsear el menú actual:", parseError);
        resetToDefault();
      }
    } else {
      console.log("No hay datos de menú, creando uno por defecto...");
      resetToDefault();
    }
  } catch (error) {
    console.error("Error general:", error);
    resetToDefault();
  } finally {
    await prisma.$disconnect();
  }
  
  // Función para resetear al menú por defecto
  async function resetToDefault() {
    const defaultMenu = [
      {
        id: `menu-item-${Date.now()}`,
        label: "Inicio",
        target: "home",
        customUrl: "",
        openInNewTab: false
      }
    ];
    
    const defaultMenuJson = JSON.stringify(defaultMenu);
    
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET navigationMenu = '${defaultMenuJson.replace(/'/g, "''")}'
      WHERE id = 'global'
    `);
    
    console.log("\nMenú por defecto creado exitosamente:");
    console.log(JSON.stringify(defaultMenu, null, 2));
  }
}

main();
