// Script para simular el comportamiento del componente NavigationMenuForm
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("=== Simulación de carga del menú de navegación ===");
    
    // 1. Obtener datos directamente de la base de datos
    const result = await prisma.$queryRaw`
      SELECT navigationMenu 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!result || !result.length || !result[0].navigationMenu) {
      console.log("No se encontró el menú de navegación en la base de datos.");
      return;
    }
    
    const navigationMenuRaw = result[0].navigationMenu;
    console.log("Valor crudo del campo navigationMenu:");
    console.log(navigationMenuRaw);
    
    // 2. Simular lo que hace el componente al cargar los datos
    console.log("\n--- Simulando el procesamiento del componente ---");
    
    // Este es el código exacto que utiliza el componente
    try {
      // Extraer menuData - simula: const config = await fetchGlobalConfig();
      const config = { navigationMenu: navigationMenuRaw };
      
      console.log("¿El campo navigationMenu existe en config?", config.navigationMenu ? "SÍ ✅" : "NO ❌");
      console.log("Tipo del campo navigationMenu:", typeof config.navigationMenu);
      
      // Simular: menuData = typeof navigationMenu === 'string' ? JSON.parse(navigationMenu) : navigationMenu
      const menuData = typeof config.navigationMenu === 'string'
        ? JSON.parse(config.navigationMenu)
        : config.navigationMenu;
      
      console.log("\nResultado del parsing (menuData):");
      console.log(typeof menuData, Array.isArray(menuData) ? `(Array con ${menuData.length} elementos)` : "");
      console.log(menuData);
      
      // Verificar si es un array (simular: if (Array.isArray(menuData)))
      console.log("\n¿Es un array?", Array.isArray(menuData) ? "SÍ ✅" : "NO ❌");
      
      // Simular: setValue('items', menuData)
      if (Array.isArray(menuData)) {
        console.log("Se establecería el valor en el formulario:", true);
        
        // Verificar la estructura de los elementos
        console.log("\nEstructura de los elementos:");
        menuData.forEach((item, index) => {
          console.log(`\nElemento ${index + 1}:`);
          console.log(`- id: ${item.id || 'FALTA ❌'}`);
          console.log(`- label: ${item.label || 'FALTA ❌'}`);
          console.log(`- target: ${item.target || 'FALTA ❌'}`);
          console.log(`- customUrl: ${item.customUrl !== undefined ? item.customUrl : 'FALTA ❌'}`);
          console.log(`- openInNewTab: ${item.openInNewTab !== undefined ? item.openInNewTab : 'FALTA ❌'}`);
        });
        
        // Verificar propiedades adicionales o inesperadas
        const expectedProps = ['id', 'label', 'target', 'customUrl', 'openInNewTab'];
        const unexpectedProps = [];
        
        menuData.forEach((item, index) => {
          const itemProps = Object.keys(item);
          itemProps.forEach(prop => {
            if (!expectedProps.includes(prop)) {
              unexpectedProps.push({ index, prop, value: item[prop] });
            }
          });
        });
        
        if (unexpectedProps.length > 0) {
          console.log("\n⚠️ Propiedades inesperadas encontradas:");
          unexpectedProps.forEach(({ index, prop, value }) => {
            console.log(`Elemento ${index + 1}, propiedad "${prop}": ${value}`);
          });
        } else {
          console.log("\n✅ No hay propiedades inesperadas");
        }

        // Verificar si algún elemento tiene una estructura inválida
        const invalidItems = menuData.filter(item => 
          !item.id || !item.label || !item.target || 
          item.openInNewTab === undefined
        );
        
        if (invalidItems.length > 0) {
          console.log("\n❌ Elementos con estructura inválida:", invalidItems.length);
          console.log("Primer elemento inválido:", invalidItems[0]);
        } else {
          console.log("\n✅ Todos los elementos tienen estructura válida");
        }
      } else {
        console.log("❌ No se puede establecer el valor en el formulario porque no es un array");
        console.log("Tipo de datos obtenido:", typeof menuData);
        
        if (typeof menuData === 'object') {
          console.log("Contenido del objeto:", menuData);
        }
      }
    } catch (error) {
      console.error("\n❌ Error simulando la carga:", error);
    }
    
    // 3. Probar con una versión simplificada del menú
    console.log("\n--- Probando con un menú simplificado ---");
    
    // Crear una versión simplificada del menú
    const simplifiedMenu = [
      {
        id: "menu-item-simple1",
        label: "Inicio",
        target: "home",
        customUrl: "",
        openInNewTab: false
      },
      {
        id: "menu-item-simple2",
        label: "Blog",
        target: "blog",
        customUrl: "",
        openInNewTab: false
      }
    ];
    
    const simplifiedMenuJson = JSON.stringify(simplifiedMenu);
    
    // Actualizar el menú con la versión simplificada
    console.log("¿Desea reemplazar el menú actual con una versión simplificada?");
    console.log("Para reemplazar manualmente, ejecute:");
    console.log(`
    // Ejecutar en un archivo JavaScript:
    await prisma.$executeRaw\`
      UPDATE GlobalConfig 
      SET navigationMenu = '${simplifiedMenuJson.replace(/'/g, "''")}'
      WHERE id = 'global'
    \`;
    `);
  } catch (error) {
    console.error("Error general:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
