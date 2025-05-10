// Script para verificar la estructura de la tabla Post
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPostTableStructure() {
  console.log('\n📊 VERIFICANDO ESTRUCTURA DE TABLA POST');
  
  try {
    console.log('1. Obteniendo estructura de la tabla Post...');
    const tableStructure = await prisma.$queryRaw`DESCRIBE Post`;
    
    console.log('\n   Campos en la tabla Post:');
    for (const field of tableStructure) {
      console.log(`   - ${field.Field} (${field.Type}) ${field.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${field.Key ? `[${field.Key}]` : ''}`);
    }
    
    // Verificar específicamente el campo categoryIds
    const categoryIdsField = tableStructure.find(f => f.Field === 'categoryIds');
    if (categoryIdsField) {
      console.log('\n   ✅ Campo categoryIds encontrado:');
      console.log(`   - Tipo: ${categoryIdsField.Type}`);
      console.log(`   - Nulo: ${categoryIdsField.Null === 'YES' ? 'Sí' : 'No'}`);
      console.log(`   - Default: ${categoryIdsField.Default || 'None'}`);
    } else {
      console.log('\n   ❌ Campo categoryIds NO encontrado en la tabla Post');
    }
    
    // 2. Comparar con la tabla Project
    console.log('\n2. Obteniendo estructura de la tabla Project para comparar...');
    const projectStructure = await prisma.$queryRaw`DESCRIBE Project`;
    
    const projectCategoryIdsField = projectStructure.find(f => f.Field === 'categoryIds');
    if (projectCategoryIdsField) {
      console.log('\n   ✅ Campo categoryIds en tabla Project:');
      console.log(`   - Tipo: ${projectCategoryIdsField.Type}`);
      console.log(`   - Nulo: ${projectCategoryIdsField.Null === 'YES' ? 'Sí' : 'No'}`);
      console.log(`   - Default: ${projectCategoryIdsField.Default || 'None'}`);
    } else {
      console.log('\n   ❌ Campo categoryIds NO encontrado en la tabla Project');
    }
    
    // 3. Verificar si la tabla Post tiene algún post con categorías
    console.log('\n3. Verificando si hay posts con categorías...');
    const postsWithCategories = await prisma.$queryRaw`
      SELECT id, title, categoryIds FROM Post 
      WHERE categoryIds IS NOT NULL AND categoryIds != ''
      LIMIT 5
    `;
    
    if (postsWithCategories.length > 0) {
      console.log(`   ✅ Encontrados ${postsWithCategories.length} posts con categorías:`);
      for (const post of postsWithCategories) {
        console.log(`   - "${post.title}" (${post.id}): "${post.categoryIds}"`);
      }
    } else {
      console.log('   ❌ No se encontraron posts con categorías');
    }
    
    // 4. Intentar una inserción directa de categoryIds
    console.log('\n4. Probando a actualizar directamente un post con categoryIds...');
    const testPost = await prisma.post.findFirst({
      where: {
        deleted: false,
      },
    });
    
    if (testPost) {
      console.log(`   Post para probar: "${testPost.title}" (${testPost.id})`);
      
      try {
        // Probar a actualizar directamente con Prisma
        await prisma.post.update({
          where: {
            id: testPost.id,
          },
          data: {
            categoryIds: JSON.stringify(["cm9lle4wv0000unx0i92w4rjb"]),
          },
        });
        
        // Verificar si se guardó
        const updatedPost = await prisma.post.findUnique({
          where: { id: testPost.id },
        });
        
        console.log(`   CategoryIds después de actualizar: "${updatedPost.categoryIds}"`);
        if (updatedPost.categoryIds) {
          console.log('   ✅ Actualización con Prisma client exitosa');
        } else {
          console.log('   ❌ Actualización con Prisma client falló (categoryIds sigue siendo null)');
          
          // Probar con SQL directo en su lugar
          console.log('   Probando con SQL directo...');
          await prisma.$executeRaw`
            UPDATE Post
            SET categoryIds = ${'["cm9lle4wv0000unx0i92w4rjb"]'}
            WHERE id = ${testPost.id}
          `;
          
          const updatedPost2 = await prisma.post.findUnique({
            where: { id: testPost.id },
          });
          
          console.log(`   CategoryIds después de SQL directo: "${updatedPost2.categoryIds}"`);
          if (updatedPost2.categoryIds) {
            console.log('   ✅ Actualización con SQL directo exitosa');
          } else {
            console.log('   ❌ Actualización con SQL directo también falló');
          }
        }
      } catch (error) {
        console.error(`   ❌ Error al actualizar post: ${error.message}`);
      }
      
      // Restaurar el post a su estado original
      try {
        await prisma.post.update({
          where: {
            id: testPost.id,
          },
          data: {
            categoryIds: null,
          },
        });
      } catch (error) {
        console.error(`   Error al restaurar post: ${error.message}`);
      }
    } else {
      console.log('   ❌ No se encontraron posts para probar');
    }
    
  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n📝 VERIFICACIÓN COMPLETADA');
  }
}

// Ejecutar la función
checkPostTableStructure()
  .catch(error => {
    console.error('Error en la ejecución:', error);
    process.exit(1);
  });
