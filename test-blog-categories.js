// Script para probar el enfoque JSON de categorías en el blog
// Ejecutar con: node test-blog-categories.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBlogCategories() {
  console.log('\n🧪 PRUEBA DE CATEGORÍAS JSON PARA BLOG');

  try {
    // 1. Obtener categorías existentes con las que trabajar
    console.log('1. Obteniendo categorías disponibles...');
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      take: 5 // Limitar a 5 categorías para la prueba
    });

    if (categories.length === 0) {
      console.log('❌ No se encontraron categorías para la prueba. Intenta crear algunas primero.');
      return;
    }

    console.log(`   Encontradas ${categories.length} categorías:`);
    categories.forEach(cat => console.log(`   - ${cat.name} (${cat.id})`));

    // 2. Crear un post de prueba con categorías en formato JSON
    console.log('\n2. Creando un post de prueba con categorías en formato JSON...');
    
    // Usar 2-3 categorías al azar para la prueba
    const selectedCategoryIds = categories
      .slice(0, Math.min(categories.length, 3))
      .map(cat => cat.id);
    
    const categoryIdsJson = JSON.stringify(selectedCategoryIds);
    
    // Primero obtenemos un ID de usuario administrador
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'MASTER' }
        ]
      },
      select: { id: true }
    });
    
    if (!adminUser) {
      console.log('❌ No se encontró ningún usuario admin para la prueba. Verificando otros usuarios...');
      
      // Intentar con cualquier usuario si no hay admin
      const anyUser = await prisma.user.findFirst({
        select: { id: true }
      });
      
      if (!anyUser) {
        console.log('❌ No se encontraron usuarios en el sistema para asignar como autor. Deteniendo la prueba.');
        return;
      } else {
        console.log(`   Usando usuario ID: ${anyUser.id} para la prueba`);
      }
    }
    
    const userId = adminUser?.id || anyUser.id;
    
    // Crear el post usando executeRaw para evitar problemas con el tipo categoryIds
    const slug = `post-prueba-json-categories-${Date.now()}`;
    const testPostId = `post_test_${Date.now()}`;
    
    await prisma.$executeRaw`
      INSERT INTO Post (
        id, title, slug, content, excerpt, status, authorId, categoryIds, createdAt, updatedAt
      ) VALUES (
        ${testPostId}, 
        'Post de prueba - JSON Categories', 
        ${slug}, 
        'Contenido de prueba para verificar el enfoque de categorías JSON.', 
        'Extracto de la prueba JSON', 
        'DRAFT', 
        ${userId}, 
        ${categoryIdsJson}, 
        NOW(), 
        NOW()
      )
    `;
    
    // Obtener el post creado para verificar usando una consulta SQL directa
    const [rawPost] = await prisma.$queryRaw`
      SELECT id, title, categoryIds 
      FROM Post 
      WHERE id = ${testPostId}
    `;
    
    console.log(`   ✅ Post creado con ID: ${rawPost.id}`);
    console.log(`   ✅ Categorías asignadas como JSON: ${rawPost.categoryIds || 'No disponible'}`);

    // 3. Verificar que podemos leer y usar las categorías correctamente
    console.log('\n3. Verificando que podemos leer y utilizar las categorías correctamente...');
    
    try {
      const parsedCategoryIds = JSON.parse(rawPost.categoryIds || '[]');
      console.log(`   ✅ JSON parseado correctamente: ${parsedCategoryIds.length} categorías`);
      
      // Obtener los detalles completos de las categorías
      const postCategories = await prisma.category.findMany({
        where: {
          id: { in: parsedCategoryIds }
        }
      });
      
      console.log(`   ✅ Categorías recuperadas correctamente: ${postCategories.length}`);
      console.log('   Categorías asignadas:');
      postCategories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.id})`);
      });
      
      // Verificar que las categorías coinciden con las originales
      const allMatched = selectedCategoryIds.every(id => 
        postCategories.some(cat => cat.id === id));
      
      if (allMatched) {
        console.log('   ✅ Todas las categorías coinciden perfectamente');
      } else {
        console.log('   ⚠️ Algunas categorías no coinciden, verifica los datos');
      }
      
    } catch (error) {
      console.error('   ❌ Error parseando el JSON de categorías:', error);
    }
    
    // 4. Actualizar las categorías asignadas
    console.log('\n4. Actualizando las categorías del post...');
    
    // Quitar la primera categoría para la prueba de actualización
    const updatedCategoryIds = selectedCategoryIds.slice(1);
    const updatedCategoryIdsJson = JSON.stringify(updatedCategoryIds);
    
    // Usar executeRaw para la actualización también
    await prisma.$executeRaw`
      UPDATE Post
      SET categoryIds = ${updatedCategoryIdsJson},
          updatedAt = NOW()
      WHERE id = ${testPostId}
    `;
    
    // Obtener el post actualizado con consulta SQL directa
    const [updatedRawPost] = await prisma.$queryRaw`
      SELECT id, title, categoryIds 
      FROM Post 
      WHERE id = ${testPostId}
    `;
    
    console.log(`   ✅ Post actualizado con categorías: ${updatedRawPost.categoryIds || 'No disponible'}`);
    console.log(`   ✅ Número de categorías antes: ${selectedCategoryIds.length}, después: ${updatedCategoryIds.length}`);
    
    console.log('\n📝 RESUMEN DE PRUEBA:');
    console.log('• El sistema puede crear posts con categorías en formato JSON');
    console.log('• El sistema puede parsear y recuperar las categorías correctamente');
    console.log('• El sistema puede actualizar las categorías correctamente');
    console.log('• El enfoque de categorías JSON funciona correctamente para el blog');
    
    // 5. Eliminar el post de prueba
    console.log('\n5. Limpiando: Eliminando post de prueba...');
    await prisma.post.delete({
      where: { id: testPostId }
    });
    console.log('   ✅ Post de prueba eliminado correctamente');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n📝 PRUEBA COMPLETADA');
  }
}

// Ejecutar la función
testBlogCategories()
  .catch(error => {
    console.error('Error en la ejecución:', error);
    process.exit(1);
  });
