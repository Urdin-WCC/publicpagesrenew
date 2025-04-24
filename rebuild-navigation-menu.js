// Script para reconstruir completamente el menú de navegación
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Reconstruyendo completamente el menú de navegación...");
    
    // Obtener valor actual
    const result = await prisma.$queryRaw`
      SELECT navigationMenu 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!result || !result.length || !result[0].navigationMenu) {
      console.log("No se encontró el menú de navegación en la base de datos.");
      return;
    }
    
    const currentMenuRaw = result[0].navigationMenu;
    console.log("Valor actual:");
    console.log(currentMenuRaw);
    
    // Parsear el menú actual
    try {
      const items = JSON.parse(currentMenuRaw);
      
      // Crear un nuevo array con los datos extraídos pero reconstruido manualmente
      const newItems = [];
      
      if (Array.isArray(items)) {
        items.forEach(item => {
          // Crear un nuevo objeto para cada elemento
          newItems.push({
            id: item.id || `menu-item-${Date.now()}`,
            label: item.label || "Sin título",
            target: item.target || "home",
            customUrl: item.customUrl || "",
            openInNewTab: !!item.openInNewTab
          });
        });
        
        // Convertir a JSON bien formateado
        const correctJSON = JSON.stringify(newItems);
        const formattedJSON = JSON.stringify(newItems, null, 2);
        
        // Ver formato actual
        console.log("\nJSON reconstruido (formato compacto):");
        console.log(correctJSON);
        
        console.log("\nJSON reconstruido (formato legible):");
        console.log(formattedJSON);
        
        // Verificar si contiene comas entre objetos
        const hasCommasBetweenObjects = correctJSON.includes('},{');
        console.log(`\n¿Tiene comas entre objetos?: ${hasCommasBetweenObjects ? 'Sí ✅' : 'No ❌'}`);

        // Verificar si tiene comas entre campos de un objeto
        const hasCommasBetweenFields = correctJSON.includes('","');
        console.log(`¿Tiene comas entre campos?: ${hasCommasBetweenFields ? 'Sí ✅' : 'No ❌'}`);
        
        // Guardar el nuevo JSON
        await prisma.$executeRawUnsafe(`
          UPDATE GlobalConfig 
          SET navigationMenu = '${correctJSON.replace(/'/g, "''")}'
          WHERE id = 'global'
        `);
        
        console.log("\n✅ Menú reconstruido y guardado exitosamente.");
        
        // Mostrar cómo debería ser utilizado en el código
        console.log("\nCÓDIGO DE REFERENCIA:");
        console.log("Para usar en componentes React, este JSON debe parsearse:");
        console.log(`const menuItems = JSON.parse('${correctJSON}');`);
        console.log("Ejemplo de uso:");
        console.log(`menuItems.forEach(item => console.log(item.label)); // Muestra: ${newItems.map(i => i.label).join(', ')}`);
        
      } else {
        console.log("⚠️ El valor actual no es un array válido.");
      }
    } catch (error) {
      console.error("Error al procesar el JSON actual:", error);
      
      // Crear un menú completamente nuevo
      console.log("\nCreando un nuevo menú desde cero...");
      
      const newMenu = [
        {
          id: `menu-item-${Date.now()}1`,
          label: "Inicio",
          target: "home",
          customUrl: "",
          openInNewTab: false
        },
        {
          id: `menu-item-${Date.now()}2`,
          label: "Blog",
          target: "blog",
          customUrl: "",
          openInNewTab: false
        }
      ];
      
      const newMenuJson = JSON.stringify(newMenu);
      
      await prisma.$executeRawUnsafe(`
        UPDATE GlobalConfig 
        SET navigationMenu = '${newMenuJson.replace(/'/g, "''")}'
        WHERE id = 'global'
      `);
      
      console.log("\n✅ Nuevo menú creado y guardado exitosamente:");
      console.log(JSON.stringify(newMenu, null, 2));
    }
  } catch (error) {
    console.error("Error general:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
