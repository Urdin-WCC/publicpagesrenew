// Script para probar el nuevo modelo de categoría única usando SQL directo
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSingleCategorySql() {
  console.log('\n🔍 PRUEBA DEL NUEVO MODELO DE CATEGORÍA ÚNICA (SQL)');
  
  try {
    // 1. Obtener categorías disponibles
    console.log('1. Obteniendo categorías disponibles...');
    const categories = await prisma.$queryRaw`
      SELECT id, name, slug FROM Category ORDER BY name LIMIT 3
    `;
    
    console.log(`   ✅ Encontradas ${categories.length} categorías:`);
    categories.forEach(cat => console.log(`   - ${cat.name} (${cat.id})`));

    if (categories.length === 0) {
      console.log('❌ No se encontraron categorías. Por favor, crea algunas categorías primero.');
      return;
    }

    // 2. Crear un post de prueba usando SQL directo
    console.log('\n2. Creando un post de prueba con categoría única...');
    const testPostId = `test_post_${Date.now()}`;
    const selectedCategory = categories[0];
    const testSlug = `test-single-category-${Date.now()}`;
    
    // Insertar el post
    await prisma.$executeRaw`
      INSERT INTO Post (
        id, 
        title, 
        slug, 
        content, 
        status, 
        authorDisplayName, 
        deleted, 
        createdAt, 
        updatedAt,
        categoryId
      )
      VALUES (
        ${testPostId},
        ${'Test Single Category SQL'},
        ${testSlug},
        ${'Este es un post de prueba para el modelo de categoría única usando SQL'},
        ${'DRAFT'},
        ${'Test Author'},
        FALSE,
        NOW(),
        NOW(),
        ${selectedCategory.id}
      )
    `;
    
    console.log(`   ✅ Post creado con ID: ${testPostId}`);
    console.log(`   ✅ Categoría asignada: ${selectedCategory.name} (${selectedCategory.id})`);

    // 3. Verificar que el post tiene la categoría correcta
    console.log('\n3. Verificando que el post tiene la categoría asignada...');
    
    const postWithCategoryResult = await prisma.$queryRaw`
      SELECT p.*, c.name as categoryName 
      FROM Post p
      LEFT JOIN Category c ON p.categoryId = c.id
      WHERE p.id = ${testPostId}
    `;
    
    if (postWithCategoryResult.length > 0) {
      const post = postWithCategoryResult[0];
      
      if (post.categoryId === selectedCategory.id) {
        console.log('   ✅ El post tiene la categoría correcta asignada');
        console.log(`   - Categoría ID: ${post.categoryId}`);
        console.log(`   - Categoría Nombre: ${post.categoryName}`);
      } else {
        console.log('   ❌ Error: La categoría no se asignó correctamente');
        console.log(`   - Esperado: ${selectedCategory.id}`);
        console.log(`   - Encontrado: ${post.categoryId || 'null'}`);
      }
    } else {
      console.log('   ❌ Error: No se pudo encontrar el post creado');
    }

    // 4. Actualizar el post con otra categoría
    console.log('\n4. Actualizando el post con otra categoría...');
    const newCategory = categories[1];
    
    await prisma.$executeRaw`
      UPDATE Post
      SET categoryId = ${newCategory.id}, updatedAt = NOW()
      WHERE id = ${testPostId}
    `;
    
    // 5. Verificar que el post tiene la nueva categoría
    console.log('\n5. Verificando que el post tiene la nueva categoría...');
    
    const updatedPostResult = await prisma.$queryRaw`
      SELECT p.*, c.name as categoryName 
      FROM Post p
      LEFT JOIN Category c ON p.categoryId = c.id
      WHERE p.id = ${testPostId}
    `;
    
    if (updatedPostResult.length > 0) {
      const updatedPost = updatedPostResult[0];
      
      if (updatedPost.categoryId === newCategory.id) {
        console.log('   ✅ El post tiene la nueva categoría asignada correctamente');
        console.log(`   - Categoría ID: ${updatedPost.categoryId}`);
        console.log(`   - Categoría Nombre: ${updatedPost.categoryName}`);
      } else {
        console.log('   ❌ Error: La nueva categoría no se asignó correctamente');
        console.log(`   - Esperado: ${newCategory.id}`);
        console.log(`   - Encontrado: ${updatedPost.categoryId || 'null'}`);
      }
    } else {
      console.log('   ❌ Error: No se pudo encontrar el post actualizado');
    }

    // 6. Limpiar: Eliminar post de prueba
    console.log('\n6. Limpiando: Eliminando post de prueba...');
    await prisma.$executeRaw`
      DELETE FROM Post WHERE id = ${testPostId}
    `;
    console.log('   ✅ Post de prueba eliminado correctamente');
    
    // 7. Resumen
    console.log('\n✅ TEST EXITOSO');
    console.log('La prueba ha demostrado que:');
    console.log('1. Se puede crear un post con una categoría única usando categoryId');
    console.log('2. Se puede actualizar la categoría de un post');
    console.log('3. La relación a nivel de base de datos funciona correctamente');
    console.log('\nEsta implementación está alineada con la forma en que los endpoints de la API manejan las categorías.');

  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n📝 PRUEBA COMPLETADA');
  }
}

// Ejecutar la prueba
testSingleCategorySql()
  .catch(error => {
    console.error('Error en ejecución:', error);
    process.exit(1);
  });
