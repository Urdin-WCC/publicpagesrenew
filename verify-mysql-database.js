// Script para verificar la estructura de la base de datos MySQL relacionada con proyectos y categorías
// Ejecutar con: node verify-mysql-database.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseStructure() {
  // Tablas a verificar
  const tablesToCheck = [
    'Project',           // Tabla de proyectos
    'Category',          // Tabla de categorías
    '_ProjectCategories' // Tabla de relación entre proyectos y categorías
  ];
  
  console.log('\n🔍 VERIFICANDO ESTRUCTURA DE BASE DE DATOS MYSQL...');
  
  try {
    // 1. Ejecutar una consulta para ver todas las tablas disponibles
    console.log('\n📋 Consultando tablas disponibles en la base de datos...');
    
    const tablesQuery = await prisma.$queryRaw`
      SHOW TABLES
    `;
    
    console.log(`\n✅ Tablas encontradas en la base de datos (${tablesQuery.length}):`);
    
    const tableNames = tablesQuery.map(t => Object.values(t)[0]);
    tableNames.forEach(name => console.log(`   - ${name}`));
    
    // 2. Verificar si existen las tablas necesarias
    const missingTables = tablesToCheck.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`\n❌ ERROR: Faltan tablas importantes:`);
      missingTables.forEach(table => console.log(`   - ${table} (NO EXISTE)`));
    } else {
      console.log(`\n✅ Todas las tablas necesarias existen`);
    }
    
    // 3. Examinar la estructura de la tabla Project
    if (tableNames.includes('Project')) {
      const projectSchema = await prisma.$queryRaw`DESCRIBE Project`;
      console.log('\n📋 Estructura de la tabla Project:');
      projectSchema.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    }
    
    // 4. Examinar la estructura de la tabla Category
    if (tableNames.includes('Category')) {
      const categorySchema = await prisma.$queryRaw`DESCRIBE Category`;
      console.log('\n📋 Estructura de la tabla Category:');
      categorySchema.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    }
    
    // 5. Examinar la estructura de la tabla de relación _ProjectCategories
    if (tableNames.includes('_ProjectCategories')) {
      const relationSchema = await prisma.$queryRaw`DESCRIBE _ProjectCategories`;
      console.log('\n📋 Estructura de la tabla _ProjectCategories:');
      relationSchema.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
      
      // 6. Verificar si hay registros en la tabla de relación
      const relationCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM _ProjectCategories`;
      console.log(`\n📊 Relaciones entre proyectos y categorías: ${relationCount[0].count}`);
      
      // Si hay relaciones, mostrar algunas para verificar
      if (relationCount[0].count > 0) {
        const sampleRelations = await prisma.$queryRaw`
          SELECT * FROM _ProjectCategories LIMIT 5
        `;
        console.log('\n📋 Muestra de relaciones existentes:');
        sampleRelations.forEach(relation => {
          console.log(`   - Proyecto (${relation.A}) ←→ Categoría (${relation.B})`);
        });
      }
    } else {
      console.log('\n❌ ERROR CRÍTICO: La tabla _ProjectCategories no existe. Esto explica por qué las relaciones entre proyectos y categorías no están funcionando.');
    }
    
    // 7. Ejecutar una conexión de prueba para identificar el tipo específico de MySQL
    console.log('\n📋 Información sobre el servidor de base de datos:');
    try {
      const versionInfo = await prisma.$queryRaw`SELECT VERSION() as version`;
      console.log(`   - Versión del servidor: ${versionInfo[0].version}`);
      
      // Verificar si se pueden crear índices
      const indexCheck = await prisma.$queryRaw`
        SHOW INDEX FROM _ProjectCategories;
      `;
      console.log(`   - Índices en _ProjectCategories: ${indexCheck.length}`);
      for (const idx of indexCheck) {
        console.log(`     - ${idx.Key_name}: Columna ${idx.Column_name}`);
      }
    } catch (err) {
      console.log(`   - No se pudo obtener información detallada: ${err.message}`);
    }
    
    // 8. Realizar una prueba completa de inserción y eliminación de relación
    console.log('\n🧪 Ejecutando prueba práctica de relación proyecto-categoría...');
    
    try {
      // Obtener IDs existentes
      const projects = await prisma.$queryRaw`SELECT id FROM Project LIMIT 1`;
      const categories = await prisma.$queryRaw`SELECT id FROM Category LIMIT 1`;
      
      if (projects.length > 0 && categories.length > 0) {
        const projectId = projects[0].id;
        const categoryId = categories[0].id;
        
        console.log(`   - Usando Proyecto ID: ${projectId}`);
        console.log(`   - Usando Categoría ID: ${categoryId}`);
        
        // Intentar crear una relación (pero evitar duplicados con INSERT IGNORE)
        await prisma.$executeRaw`
          INSERT IGNORE INTO _ProjectCategories (A, B)
          VALUES (${projectId}, ${categoryId})
        `;
        console.log('   ✅ Relación creada (o ya existía)');
        
        // Verificar que la relación existe
        const checkResult = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM _ProjectCategories 
          WHERE A = ${projectId} AND B = ${categoryId}
        `;
        
        if (checkResult[0].count > 0) {
          console.log('   ✅ Relación verificada correctamente');
          
          // Eliminar la relación
          await prisma.$executeRaw`
            DELETE FROM _ProjectCategories 
            WHERE A = ${projectId} AND B = ${categoryId}
          `;
          console.log('   ✅ Relación eliminada');
          
          // Volver a crearla para dejarla como estaba
          await prisma.$executeRaw`
            INSERT INTO _ProjectCategories (A, B)
            VALUES (${projectId}, ${categoryId})
          `;
          console.log('   ✅ Relación restaurada');
          
          console.log('\n✅ La prueba completa fue EXITOSA - Las relaciones funcionan correctamente');
        } else {
          console.log('\n❌ ERROR: No se pudo verificar la relación. Esto sugiere un problema con los permisos o la estructura de la tabla.');
        }
      } else {
        console.log('\n⚠️ No se pudo realizar la prueba completa: No hay proyectos o categorías disponibles');
      }
    } catch (testError) {
      console.error('\n❌ ERROR en prueba práctica:', testError);
    }
    
  } catch (error) {
    console.error('\n❌ Error verificando la estructura de la base de datos:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n📝 VERIFICACIÓN COMPLETADA');
  }
}

// Ejecutar la verificación
checkDatabaseStructure()
  .catch(error => {
    console.error('Error en verificación:', error);
    process.exit(1);
  });
