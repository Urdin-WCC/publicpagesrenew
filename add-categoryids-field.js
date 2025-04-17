// Script para añadir el campo categoryIds a la tabla Project
// Ejecutar con: node add-categoryids-field.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addCategoryIdsField() {
  console.log('\n🔧 AÑADIENDO CAMPO categoryIds A LA TABLA Project...');
  
  try {
    // Verificar si el campo ya existe
    console.log('1. Verificando estructura actual de la tabla Project...');
    const columns = await prisma.$queryRaw`
      SHOW COLUMNS FROM Project
    `;
    
    const columnNames = columns.map(col => col.Field);
    console.log(`   Columnas existentes: ${columnNames.join(', ')}`);
    
    if (columnNames.includes('categoryIds')) {
      console.log('✅ El campo categoryIds ya existe. No se requieren cambios.');
      return;
    }
    
    // Añadir el campo categoryIds
    console.log('2. Añadiendo el campo categoryIds a la tabla Project...');
    await prisma.$executeRaw`
      ALTER TABLE Project 
      ADD COLUMN categoryIds TEXT NULL 
      COMMENT 'IDs de categorías almacenados como JSON'
    `;
    
    // Verificar que el campo se ha añadido correctamente
    console.log('3. Verificando que el campo se ha añadido correctamente...');
    const updatedColumns = await prisma.$queryRaw`
      SHOW COLUMNS FROM Project
    `;
    
    const updatedColumnNames = updatedColumns.map(col => col.Field);
    
    if (updatedColumnNames.includes('categoryIds')) {
      console.log('✅ El campo categoryIds ha sido añadido correctamente.');
    } else {
      console.log('❌ Error: No se pudo verificar la adición del campo categoryIds.');
    }
    
    // Información sobre cómo utilizar el nuevo campo
    console.log('\n📝 RECOMENDACIONES DE USO:');
    console.log('• Para guardar categorías: Project.categoryIds = JSON.stringify(arrayDeIds)');
    console.log('• Para leer categorías: const categorías = JSON.parse(Project.categoryIds || "[]")');
    
  } catch (error) {
    console.error('❌ Error al modificar la tabla Project:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n📝 OPERACIÓN COMPLETADA');
  }
}

// Ejecutar la función
addCategoryIdsField()
  .catch(error => {
    console.error('Error en la ejecución:', error);
    process.exit(1);
  });
