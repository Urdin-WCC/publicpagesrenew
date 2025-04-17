// Script para verificar la estructura de la base de datos relacionada con proyectos y categorías
// Ejecutar con: node verify-database-structure.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseStructure() {
  // Tablas a verificar
  const tablesToCheck = [
    'Project',           // Tabla de proyectos
    'Category',          // Tabla de categorías
    '_ProjectCategories' // Tabla de relación entre proyectos y categorías
  ];
  
  console.log('\n🔍 VERIFICANDO ESTRUCTURA DE BASE DE DATOS...');
  
  try {
    // 1. Ejecutar una consulta para ver todas las tablas disponibles
    console.log('\n📋 Consultando tablas disponibles en la base de datos...');
    
    const tablesQuery = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name;
    `;
    
    console.log(`\n✅ Tablas encontradas en la base de datos (${tablesQuery.length}):`);
    
    const tableNames = tablesQuery.map(t => t.name);
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
      const projectSchema = await prisma.$queryRaw`PRAGMA table_info(Project)`;
      console.log('\n📋 Estructura de la tabla Project:');
      projectSchema.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
      });
    }
    
    // 4. Examinar la estructura de la tabla Category
    if (tableNames.includes('Category')) {
      const categorySchema = await prisma.$queryRaw`PRAGMA table_info(Category)`;
      console.log('\n📋 Estructura de la tabla Category:');
      categorySchema.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
      });
    }
    
    // 5. Examinar la estructura de la tabla de relación _ProjectCategories
    if (tableNames.includes('_ProjectCategories')) {
      const relationSchema = await prisma.$queryRaw`PRAGMA table_info(_ProjectCategories)`;
      console.log('\n📋 Estructura de la tabla _ProjectCategories:');
      relationSchema.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
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
    }
    
    // 7. Intentar un INSERT y DELETE de prueba en la tabla _ProjectCategories 
    // para verificar si tenemos permisos correctos
    if (tableNames.includes('_ProjectCategories')) {
      console.log('\n🧪 Probando operaciones en la tabla _ProjectCategories...');
      
      // Obtener un proyecto y una categoría existentes
      const projects = await prisma.project.findMany({ take: 1 });
      const categories = await prisma.category.findMany({ take: 1 });
      
      if (projects.length > 0 && categories.length > 0) {
        const projectId = projects[0].id;
        const categoryId = categories[0].id;
        
        console.log(`   - Usando Proyecto: ${projectId}`);
        console.log(`   - Usando Categoría: ${categoryId}`);
        
        try {
          // Intentar insertar una relación de prueba
          console.log('   - Intentando INSERT en _ProjectCategories...');
          
          await prisma.$executeRawUnsafe(`
            INSERT INTO _ProjectCategories (A, B) VALUES (?, ?) 
            ON CONFLICT (A, B) DO NOTHING
          `, projectId, categoryId);
          
          console.log('   ✅ INSERT completado exitosamente');
          
          // Intentar eliminar la relación de prueba
          console.log('   - Intentando DELETE en _ProjectCategories...');
          
          await prisma.$executeRawUnsafe(`
            DELETE FROM _ProjectCategories WHERE A = ? AND B = ?
          `, projectId, categoryId);
          
          console.log('   ✅ DELETE completado exitosamente');
          
          console.log('\n✅ Las operaciones de prueba en _ProjectCategories fueron exitosas');
        } catch (error) {
          console.error('\n❌ Error en operaciones de prueba:', error);
        }
      } else {
        console.log('   ⚠️ No se pudo realizar la prueba: No hay proyectos o categorías disponibles');
      }
    }
    
    // 8. Verificar la configuración del cliente de Prisma
    console.log('\n📋 Verificando configuración de Prisma...');
    const prismaSchema = await prisma.$queryRaw`SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 3`;
    console.log(`\n✅ Últimas migraciones de Prisma (${prismaSchema.length}):`);
    prismaSchema.forEach(migration => {
      console.log(`   - ${migration.migration_name} (${migration.finished_at})`);
    });
    
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
