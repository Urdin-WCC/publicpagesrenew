// Script para probar el nuevo modelo de categoría única
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSingleCategory() {
  console.log('\n🔍 PRUEBA DEL NUEVO MODELO DE CATEGORÍA ÚNICA');
  
  try {
    // 1. Obtener categorías disponibles
    console.log('1. Obteniendo categorías disponibles...');
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      take: 3,
      select: { id: true, name: true, slug: true }
    });
    
    console.log(`   ✅ Encontradas ${categories.length} categorías:`);
    categories.forEach(cat => console.log(`   - ${cat.name} (${cat.id})`));

    if (categories.length === 0) {
      console.log('❌ No se encontraron categorías. Por favor, crea algunas categorías primero.');
      return;
    }

    // 2. Crear un post de prueba
    console.log('\n2. Creando un post de prueba con categoría única...');
    const testPostId = `test_post_${Date.now()}`;
    const selectedCategory = categories[0];
    
    const newPost = await prisma.post.create({
      data: {
        id: testPostId,
        title: 'Test Single Category',
        slug: `test-single-category-${Date.now()}`,
        content: 'Este es un post de prueba para el modelo de categoría única',
        status: 'DRAFT',
        authorDisplayName: 'Test Author',
        deleted: false,
        category: {
          connect: { id: selectedCategory.id } // Usar connect para establecer la relación
        }
      }
    });
    
    console.log(`   ✅ Post creado con ID: ${newPost.id}`);
    console.log(`   ✅ Categoría asignada: ${selectedCategory.name} (${selectedCategory.id})`);

    // 3. Verificar que el post tiene la categoría correcta
    console.log('\n3. Verificando que el post tiene la categoría asignada...');
    
    const postWithCategory = await prisma.post.findUnique({
      where: { id: testPostId },
      include: {
        category: true
      }
    });
    
    if (postWithCategory.categoryId === selectedCategory.id) {
      console.log('   ✅ El post tiene la categoría correcta asignada');
      console.log(`   - Categoría ID: ${postWithCategory.categoryId}`);
      console.log(`   - Categoría Nombre: ${postWithCategory.category.name}`);
    } else {
      console.log('   ❌ Error: La categoría no se asignó correctamente');
      console.log(`   - Esperado: ${selectedCategory.id}`);
      console.log(`   - Encontrado: ${postWithCategory.categoryId || 'null'}`);
    }

    // 4. Actualizar el post con otra categoría
    console.log('\n4. Actualizando el post con otra categoría...');
    const newCategory = categories[1];
    
    await prisma.post.update({
      where: { id: testPostId },
      data: {
        category: {
          connect: { id: newCategory.id } // Usar connect para establecer la relación
        }
      }
    });
    
    // 5. Verificar que el post tiene la nueva categoría
    console.log('\n5. Verificando que el post tiene la nueva categoría...');
    
    const updatedPost = await prisma.post.findUnique({
      where: { id: testPostId },
      include: {
        category: true
      }
    });
    
    if (updatedPost.categoryId === newCategory.id) {
      console.log('   ✅ El post tiene la nueva categoría asignada correctamente');
      console.log(`   - Categoría ID: ${updatedPost.categoryId}`);
      console.log(`   - Categoría Nombre: ${updatedPost.category.name}`);
    } else {
      console.log('   ❌ Error: La nueva categoría no se asignó correctamente');
      console.log(`   - Esperado: ${newCategory.id}`);
      console.log(`   - Encontrado: ${updatedPost.categoryId || 'null'}`);
    }

    // 6. Limpiar: Eliminar post de prueba
    console.log('\n6. Limpiando: Eliminando post de prueba...');
    await prisma.post.delete({
      where: { id: testPostId }
    });
    console.log('   ✅ Post de prueba eliminado correctamente');

  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n📝 PRUEBA COMPLETADA');
  }
}

// Ejecutar la prueba
testSingleCategory()
  .catch(error => {
    console.error('Error en ejecución:', error);
    process.exit(1);
  });
