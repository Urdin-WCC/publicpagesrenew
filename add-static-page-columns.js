// Script para añadir columnas faltantes a la tabla StaticPage
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Columnas nuevas a agregar - Basadas en el componente PageForm.tsx
 * - showHeader (para mostrar/ocultar la cabecera)
 * - showFooter (para mostrar/ocultar el pie de página)
 * - showSidebar (para mostrar/ocultar la barra lateral)
 * - sidebarPosition (posición de la barra lateral: "left" o "right")
 * - metaTitle (título para SEO)
 * - metaDescription (descripción para SEO)
 * - metaKeywords (palabras clave para SEO)
 */

async function main() {
  try {
    console.log("=== Agregando columnas faltantes a la tabla StaticPage ===");
    
    // 1. Verificar si las columnas ya existen
    console.log("Verificando columnas existentes...");
    const columns = await prisma.$queryRaw`SHOW COLUMNS FROM StaticPage`;
    const existingColumns = columns.map(c => c.Field);
    console.log("Columnas existentes:", existingColumns.join(", "));
    
    // 2. Definir las nuevas columnas a agregar
    const newColumns = [
      { name: 'showHeader', definition: 'BOOLEAN DEFAULT true' },
      { name: 'showFooter', definition: 'BOOLEAN DEFAULT true' },
      { name: 'showSidebar', definition: 'BOOLEAN DEFAULT false' },
      { name: 'sidebarPosition', definition: "VARCHAR(10) DEFAULT 'left'" },
      { name: 'metaTitle', definition: 'VARCHAR(255)' },
      { name: 'metaDescription', definition: 'TEXT' },
      { name: 'metaKeywords', definition: 'VARCHAR(255)' }
    ];
    
    // 3. Filtrar solo las columnas que no existen
    const columnsToAdd = newColumns.filter(col => !existingColumns.includes(col.name));
    
    if (columnsToAdd.length === 0) {
      console.log("✅ Todas las columnas ya existen en la tabla");
    } else {
      console.log(`Columnas por agregar (${columnsToAdd.length}): ${columnsToAdd.map(c => c.name).join(", ")}`);
      
      // 4. Agregar cada columna faltante
      for (const col of columnsToAdd) {
        console.log(`Agregando columna: ${col.name}`);
        try {
          await prisma.$executeRawUnsafe(`ALTER TABLE StaticPage ADD COLUMN ${col.name} ${col.definition}`);
          console.log(`✅ Columna ${col.name} agregada exitosamente.`);
        } catch (error) {
          console.error(`Error al agregar la columna ${col.name}:`, error);
        }
      }
    }
    
    // 5. Actualizar los archivos de consulta (esto es solo informativo)
    console.log("\n=== INSTRUCCIONES PARA ACTUALIZAR API ===");
    console.log("Por favor, actualiza estas consultas SQL en los archivos API:");
    
    console.log("\n1. En app/api/pages/[id]/route.ts (GET):");
    console.log(`
    const pageResult = await prisma.$queryRaw\`
      SELECT id, title, slug, contentHtml, isVisible, showHeader, showFooter, 
             showSidebar, sidebarPosition, metaTitle, metaDescription, metaKeywords, 
             createdAt, updatedAt
      FROM StaticPage
      WHERE id = \${id}
      LIMIT 1
    \`;
    `);
    
    console.log("\n2. En app/api/pages/[id]/route.ts (PUT):");
    console.log(`
    await prisma.$queryRaw\`
      UPDATE StaticPage
      SET 
        title = \${body.title}, 
        slug = \${body.slug}, 
        contentHtml = \${body.contentHtml},
        isVisible = \${body.isVisible},
        showHeader = \${body.showHeader},
        showFooter = \${body.showFooter},
        showSidebar = \${body.showSidebar},
        sidebarPosition = \${body.sidebarPosition},
        metaTitle = \${body.metaTitle},
        metaDescription = \${body.metaDescription},
        metaKeywords = \${body.metaKeywords},
        updatedAt = CURRENT_TIMESTAMP()
      WHERE id = \${id}
    \`;
    `);
    
    console.log("\n3. En app/api/pages/route.ts (POST):");
    console.log(`
    const result = await prisma.$queryRaw\`
      INSERT INTO StaticPage (
        title, slug, contentHtml, isVisible, showHeader, showFooter, 
        showSidebar, sidebarPosition, metaTitle, metaDescription, metaKeywords
      ) VALUES (
        \${body.title}, \${body.slug}, \${body.contentHtml}, \${body.isVisible}, 
        \${body.showHeader}, \${body.showFooter}, \${body.showSidebar}, 
        \${body.sidebarPosition}, \${body.metaTitle}, \${body.metaDescription}, 
        \${body.metaKeywords}
      )
    \`;
    `);
    
    console.log("\n=== Proceso completado ===");
    
  } catch (error) {
    console.error("Error general:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log("Script finalizado."))
  .catch(e => console.error("Error en script principal:", e));
