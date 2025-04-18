// Script para probar la funcionalidad de categoría única en el blog

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBlogSingleCategory() {
  try {
    console.log('🔍 Iniciando pruebas de categoría única para el blog...\n');
    
    // 1. Obtener todas las categorías disponibles
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true }
    });
    console.log(`📋 Categorías disponibles: ${categories.length}`);
    categories.forEach(cat => console.log(`   - ${cat.name} (${cat.id})`));
    
    if (categories.length === 0) {
      console.log('❌ No hay categorías para probar. Crea algunas categorías primero.');
      return;
    }
    
    // 2. Crear un post de prueba con una categoría única
    const testCategory = categories[0]; // Usamos la primera categoría disponible
    const testPost = await prisma.post.create({
      data: {
        title: `Test Categoría Única ${new Date().toISOString()}`,
        slug: `test-categoria-unica-${Date.now()}`,
        content: '<p>Este es un post de prueba para la categoría única</p>',
        status: 'DRAFT',
        authorId: await getAdminUserId(), // Obtener un ID de usuario admin
        categoryIds: JSON.stringify([testCategory.id]), // Guardamos como JSON array con un solo elemento
      }
    });
    
    console.log(`\n✅ Post creado: ${testPost.id} (${testPost.title})`);
    console.log(`   - categoryIds: ${testPost.categoryIds}`);
    
    // 3. Obtener el post con sus categorías
    const postWithCategories = await prisma.post.findUnique({
      where: { id: testPost.id },
      select: { id: true, title: true, categoryIds: true }
    });
    
    console.log('\n📊 Verificando categoryIds almacenado:');
    console.log(`   - Valor raw: ${postWithCategories.categoryIds}`);
    
    // 4. Decodificar el JSON de categoryIds
    let decodedCategories = [];
    try {
      if (postWithCategories.categoryIds) {
        decodedCategories = JSON.parse(postWithCategories.categoryIds);
      }
      console.log('   - Valor parseado:', decodedCategories);
      console.log(`   - Número de IDs: ${decodedCategories.length}`);
      
      if (decodedCategories.length === 1 && decodedCategories[0] === testCategory.id) {
        console.log('✅ La categoría única se guardó correctamente en formato JSON array.');
      } else {
        console.log('❌ Problema con la categoría almacenada. Formato incorrecto o ID equivocado.');
      }
    } catch (error) {
      console.error('❌ Error al decodificar categoryIds:', error);
    }
    
    // 5. Probar la API para verificar que devuelve las categorías correctamente
    console.log('\n🌐 Probando endpoint de API para obtener el post con categorías...');
    
    // Usando fetch nativo de Node.js (requiere Node.js 18+)
    const response = await fetch(`http://localhost:3000/api/blog/${testPost.id}`);
    
    if (!response.ok) {
      console.error(`❌ Error al obtener el post: ${response.status} ${response.statusText}`);
      return;
    }
    
    const postFromApi = await response.json();
    console.log(`✅ Post obtenido desde API: ${postFromApi.id}`);
    console.log('   - Categorías en la respuesta API:', postFromApi.categories);
    
    if (Array.isArray(postFromApi.categories) && 
        postFromApi.categories.length === 1 &&
        postFromApi.categories[0].id === testCategory.id) {
      console.log('✅ La API devuelve correctamente un array con la categoría única.');
    } else {
      console.log('❌ La API no devuelve el formato esperado para las categorías.');
    }
    
    // 6. Limpiar: eliminar el post de prueba
    await prisma.post.delete({ where: { id: testPost.id } });
    console.log(`\n🧹 Post de prueba eliminado.`);
    
    console.log('\n✅ Prueba completada con éxito!');
    
  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Función auxiliar para obtener un ID de usuario administrador
async function getAdminUserId() {
  const adminUser = await prisma.user.findFirst({
    where: { 
      OR: [
        { role: 'ADMIN' },
        { role: 'SUPERADMIN' }
      ]
    },
    select: { id: true }
  });
  
  if (!adminUser) {
    throw new Error('No se encontró un usuario administrador para realizar las pruebas');
  }
  
  return adminUser.id;
}

// Ejecutar la prueba
testBlogSingleCategory();
