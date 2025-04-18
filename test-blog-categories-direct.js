// Script para probar directamente el manejo de categorías en el blog usando Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBlogCategoriesDirect() {
  console.log('\n🔍 PRUEBA DIRECTA DE MANEJO DE CATEGORÍAS EN BLOG');
  
  try {
    // 1. Obtener categorías disponibles
    console.log('1. Obteniendo categorías disponibles...');
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    
    console.log(`   ✅ Encontradas ${categories.length} categorías:`);
    categories.forEach(cat => console.log(`   - ${cat.name} (${cat.id})`));

    if (categories.length < 2) {
      console.log('❌ No hay suficientes categorías para la prueba. Se necesitan al menos 2.');
      return;
    }

    // 2. Crear un post de prueba
    console.log('\n2. Creando un post de prueba...');
    const testPostId = `test_post_${Date.now()}`;
    
    // Exactamente como lo hace el frontend - sin incluir categoryIds en el INSERT inicial
    const newPost = await prisma.$queryRaw`
      INSERT INTO Post (
        id,
        title,
        slug,
        content,
        excerpt,
        coverImage,
        status,
        featured,
        authorDisplayName,
        authorId,
        createdAt,
        updatedAt,
        deleted
      )
      VALUES (
        ${testPostId},
        ${'Post de Prueba UI'},
        ${'post-prueba-ui'},
        ${'Contenido de prueba'},
        ${'Extracto de prueba'},
        ${null},
        ${'DRAFT'},
        ${false},
        ${'AutorUI'},
        ${null},
        CURRENT_TIMESTAMP(),
        CURRENT_TIMESTAMP(),
        FALSE
      )
    `;

    console.log(`   ✅ Post creado con ID: ${testPostId}`);
    
    // 3. Seleccionar dos categorías para asignar (simular selección en UI)
    const selectedCategoryIds = [categories[0].id, categories[1].id];
    console.log('\n3. Seleccionando categorías para asignar:');
    selectedCategoryIds.forEach(id => {
      const cat = categories.find(c => c.id === id);
      console.log(`   - ${cat.name} (${id})`);
    });
    
    // 4. Actualizar el post con las categorías - COMO LO HACE EL FRONTEND
    console.log('\n4. Actualizando post con las categorías seleccionadas...');
    
    // Formato de categorías exacto que envía el frontend
    const categoryIdsJson = JSON.stringify(selectedCategoryIds);
    
    console.log(`   Categorías a guardar (JSON): ${categoryIdsJson}`);
    
    // Actualizar el post como lo hace la API del blog
    await prisma.$executeRaw`
      UPDATE Post
      SET 
        categoryIds = ${categoryIdsJson},
        updatedAt = CURRENT_TIMESTAMP()
      WHERE id = ${testPostId}
    `;
    
    console.log('   ✅ Post actualizado con categorías');
    
    // 5. Verificar que se hayan guardado correctamente las categorías
    console.log('\n5. Verificando categorías guardadas...');
    const updatedPost = await prisma.post.findUnique({
      where: { id: testPostId },
    });
    
    console.log(`   CategoryIds almacenado: ${updatedPost.categoryIds}`);
    
    // Parsear categoryIds para verificar
    let parsedCategoryIds = [];
    try {
      parsedCategoryIds = JSON.parse(updatedPost.categoryIds);
      console.log(`   ✅ CategoryIds parseado correctamente: ${parsedCategoryIds.length} categorías`);
      parsedCategoryIds.forEach(id => console.log(`   - ${id}`));
      
      // Verificar coincidencia con las categorías originales
      const allFound = selectedCategoryIds.every(id => parsedCategoryIds.includes(id));
      const correctCount = selectedCategoryIds.length === parsedCategoryIds.length;
      
      if (allFound && correctCount) {
        console.log('   ✅ Todas las categorías coinciden perfectamente');
      } else {
        console.log('   ❌ Las categorías no coinciden:');
        console.log(`   - Original: ${selectedCategoryIds.join(', ')}`);
        console.log(`   - Guardado: ${parsedCategoryIds.join(', ')}`);
      }
    } catch (error) {
      console.error(`   ❌ Error al parsear categoryIds: ${error.message}`);
      console.log(`   Raw categoryIds: "${updatedPost.categoryIds}"`);
    }
    
    // 6. Obtener el post con las categorías expandidas (simular GET)
    console.log('\n6. Obteniendo post con categorías expandidas...');
    
    // Primero obtener el post
    const post = await prisma.post.findUnique({
      where: { id: testPostId },
    });
    
    // Luego expandir las categorías como lo hace la API GET
    let expandedCategories = [];
    try {
      // Parsear categoryIds
      const categoryIds = post.categoryIds ? JSON.parse(post.categoryIds) : [];
      
      if (categoryIds.length > 0) {
        // Obtener detalles de las categorías
        expandedCategories = await prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true, slug: true }
        });
      }
      
      console.log(`   ✅ Categorías expandidas: ${expandedCategories.length}`);
      expandedCategories.forEach(cat => console.log(`   - ${cat.name} (${cat.id})`));
    } catch (error) {
      console.error(`   ❌ Error al expandir categorías: ${error.message}`);
    }
    
    // 7. Limpiar: Eliminar post de prueba
    console.log('\n7. Limpiando: Eliminando post de prueba...');
    await prisma.post.delete({
      where: { id: testPostId },
    });
    console.log('   ✅ Post de prueba eliminado correctamente');
    
  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n📝 PRUEBA COMPLETADA');
  }
}

// Ejecutar la función
testBlogCategoriesDirect()
  .catch(error => {
    console.error('Error en la ejecución:', error);
    process.exit(1);
  });
