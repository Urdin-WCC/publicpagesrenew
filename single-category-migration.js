// Script para migrar de múltiples categorías a una sola categoría por post/project
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function singleCategoryMigration() {
  console.log('\n🔄 MIGRANDO A MODELO DE CATEGORÍA ÚNICA');
  
  try {
    // 1. Eliminar las columnas categoryIds existentes
    console.log('\n1. Eliminando columnas categoryIds existentes...');
    
    // Comprobar si existe la columna en Post
    const postColumnsResult = await prisma.$queryRaw`SHOW COLUMNS FROM Post LIKE 'categoryIds'`;
    if (postColumnsResult.length > 0) {
      console.log('   Eliminando categoryIds de tabla Post...');
      await prisma.$executeRaw`ALTER TABLE Post DROP COLUMN categoryIds`;
      console.log('   ✅ Columna categoryIds eliminada de tabla Post');
    } else {
      console.log('   La columna categoryIds no existe en la tabla Post');
    }
    
    // Comprobar si existe la columna en Project
    const projectColumnsResult = await prisma.$queryRaw`SHOW COLUMNS FROM Project LIKE 'categoryIds'`;
    if (projectColumnsResult.length > 0) {
      console.log('   Eliminando categoryIds de tabla Project...');
      await prisma.$executeRaw`ALTER TABLE Project DROP COLUMN categoryIds`;
      console.log('   ✅ Columna categoryIds eliminada de tabla Project');
    } else {
      console.log('   La columna categoryIds no existe en la tabla Project');
    }
    
    // 2. Añadir nuevas columnas categoryId (singular)
    console.log('\n2. Añadiendo nuevas columnas categoryId...');
    
    // Añadir a Post
    try {
      console.log('   Añadiendo categoryId a tabla Post...');
      await prisma.$executeRaw`
        ALTER TABLE Post 
        ADD COLUMN categoryId VARCHAR(191) NULL,
        ADD CONSTRAINT FK_Post_CategoryId
        FOREIGN KEY (categoryId) REFERENCES Category(id)
      `;
      console.log('   ✅ Columna categoryId añadida a tabla Post');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('   La columna categoryId ya existe en la tabla Post');
      } else {
        throw error;
      }
    }
    
    // Añadir a Project
    try {
      console.log('   Añadiendo categoryId a tabla Project...');
      await prisma.$executeRaw`
        ALTER TABLE Project 
        ADD COLUMN categoryId VARCHAR(191) NULL,
        ADD CONSTRAINT FK_Project_CategoryId
        FOREIGN KEY (categoryId) REFERENCES Category(id)
      `;
      console.log('   ✅ Columna categoryId añadida a tabla Project');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('   La columna categoryId ya existe en la tabla Project');
      } else {
        throw error;
      }
    }
    
    // 3. Verificar que las columnas se han añadido correctamente
    console.log('\n3. Verificando estructura final de las tablas...');
    
    const postColumns = await prisma.$queryRaw`DESCRIBE Post`;
    const postHasCategoryId = postColumns.some(col => col.Field === 'categoryId');
    console.log(`   Post tiene categoryId: ${postHasCategoryId ? 'Sí ✅' : 'No ❌'}`);
    
    const projectColumns = await prisma.$queryRaw`DESCRIBE Project`;
    const projectHasCategoryId = projectColumns.some(col => col.Field === 'categoryId');
    console.log(`   Project tiene categoryId: ${projectHasCategoryId ? 'Sí ✅' : 'No ❌'}`);
    
    // 4. Verificar que existen categorías disponibles
    console.log('\n4. Verificando categorías disponibles...');
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true }
    });
    
    if (categories.length > 0) {
      console.log(`   ✅ Se encontraron ${categories.length} categorías disponibles:`);
      categories.forEach(cat => console.log(`      - ${cat.name} (${cat.id})`));
    } else {
      console.log('   ⚠️ No se encontraron categorías. Deberás crear algunas.');
    }
    
    // Resumen final
    console.log('\n✅ MIGRACIÓN COMPLETADA');
    console.log('Ahora puedes:');
    console.log('1. Actualizar el esquema de Prisma para reflejar los cambios');
    console.log('2. Modificar los formularios para usar un desplegable de categoría única');
    console.log('3. Actualizar los endpoints API para manejar la nueva estructura');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA MIGRACIÓN:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la migración
singleCategoryMigration()
  .catch(error => {
    console.error('Error en ejecución:', error);
    process.exit(1);
  });
