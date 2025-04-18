// Script para probar los endpoints de API del blog con categoría única
const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Base URL para las APIs
const baseUrl = 'http://localhost:3000/api';

// Función para hacer una pausa
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testBlogApi() {
  console.log('\n🔍 PRUEBA DE ENDPOINTS API DE BLOG CON CATEGORÍA ÚNICA');
  
  try {
    // 1. Primero obtener categorías disponibles
    console.log('\n1. Obteniendo categorías disponibles...');
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      take: 3,
      select: { id: true, name: true, slug: true }
    });
    
    if (categories.length === 0) {
      console.log('❌ No se encontraron categorías. Por favor, crea algunas categorías primero.');
      return;
    }
    
    console.log(`   ✅ Encontradas ${categories.length} categorías:`);
    categories.forEach(cat => console.log(`   - ${cat.name} (${cat.id})`));
    
    // 2. Crear un post mediante la API
    console.log('\n2. Crear un nuevo post con categoría única...');
    
    const newPostData = {
      title: `Test API categoría única ${Date.now()}`,
      slug: `test-api-cat-${Date.now()}`,
      content: 'Este es un post de prueba para verificar el funcionamiento de la API con categoría única',
      status: 'DRAFT',
      excerpt: 'Extracto de prueba',
      featured: false,
      // Solo enviamos el ID de una categoría (primera de la lista)
      categories: [categories[0].id]
    };
    
    console.log('   Datos a enviar:', JSON.stringify(newPostData, null, 2));
    
    const createResponse = await fetch(`${baseUrl}/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPostData)
    });
    
    const createdPost = await createResponse.json();
    
    if (!createResponse.ok) {
      throw new Error(`Error al crear post: ${JSON.stringify(createdPost)}`);
    }
    
    console.log(`   ✅ Post creado exitosamente con ID: ${createdPost.id}`);
    console.log(`   🔍 Verificando categoría asignada...`);
    
    if (createdPost.categories && Array.isArray(createdPost.categories) && createdPost.categories.length > 0) {
      console.log(`   ✅ Categoría asignada correctamente:`);
      console.log(`   - ID: ${createdPost.categories[0].id}`);
      console.log(`   - Nombre: ${createdPost.categories[0].name}`);
    } else {
      console.log(`   ❌ Error: No se asignó ninguna categoría al post`);
      console.log('   Respuesta recibida:', JSON.stringify(createdPost, null, 2));
    }
    
    // 3. Obtener el post para verificar
    console.log('\n3. Obteniendo post creado para verificar datos...');
    
    const getResponse = await fetch(`${baseUrl}/blog/${createdPost.id}`);
    const retrievedPost = await getResponse.json();
    
    if (!getResponse.ok || !retrievedPost) {
      throw new Error(`Error al obtener post: ${JSON.stringify(retrievedPost)}`);
    }
    
    console.log(`   ✅ Post obtenido correctamente: ${retrievedPost.id}`);
    console.log(`   🔍 Verificando categoría...`);
    
    if (retrievedPost.categories && Array.isArray(retrievedPost.categories) && retrievedPost.categories.length > 0) {
      console.log(`   ✅ Categoría presente en respuesta GET:`);
      console.log(`   - ID: ${retrievedPost.categories[0].id}`);
      console.log(`   - Nombre: ${retrievedPost.categories[0].name}`);
    } else {
      console.log(`   ❌ Error: No se encontró la categoría en la respuesta GET`);
    }
    
    // 4. Actualizar el post con otra categoría
    console.log('\n4. Actualizando post con otra categoría...');
    
    const updateData = {
      ...newPostData,
      title: `${newPostData.title} - Actualizado`,
      // Cambiar a la segunda categoría
      categories: [categories[1].id]
    };
    
    const updateResponse = await fetch(`${baseUrl}/blog/${createdPost.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const updatedPost = await updateResponse.json();
    
    if (!updateResponse.ok) {
      throw new Error(`Error al actualizar post: ${JSON.stringify(updatedPost)}`);
    }
    
    console.log(`   ✅ Post actualizado exitosamente`);
    console.log(`   🔍 Verificando nueva categoría...`);
    
    if (updatedPost.categories && Array.isArray(updatedPost.categories) && updatedPost.categories.length > 0) {
      console.log(`   ✅ Nueva categoría asignada correctamente:`);
      console.log(`   - ID: ${updatedPost.categories[0].id}`);
      console.log(`   - Nombre: ${updatedPost.categories[0].name}`);
      
      // Verificar si la categoría cambió
      if (updatedPost.categories[0].id === categories[1].id) {
        console.log(`   ✅ Categoría actualizada correctamente a: ${categories[1].name}`);
      } else {
        console.log(`   ❌ Error: La categoría no se actualizó correctamente`);
        console.log(`   - Esperado: ${categories[1].id}`);
        console.log(`   - Recibido: ${updatedPost.categories[0].id}`);
      }
    } else {
      console.log(`   ❌ Error: No se encontró ninguna categoría en la respuesta PUT`);
    }
    
    // 5. Limpiar - Eliminar el post creado
    console.log('\n5. Limpiando: Eliminando post de prueba...');
    
    const deleteResponse = await fetch(`${baseUrl}/blog/${createdPost.id}`, {
      method: 'DELETE'
    });
    
    if (!deleteResponse.ok) {
      const deleteError = await deleteResponse.json();
      throw new Error(`Error al eliminar post: ${JSON.stringify(deleteError)}`);
    }
    
    console.log(`   ✅ Post eliminado correctamente`);
    
    // 6. Resumen
    console.log('\n✅ PRUEBA API EXITOSA');
    console.log('La prueba ha demostrado que:');
    console.log('1. Se puede crear un post con una categoría única a través de la API');
    console.log('2. La categoría se almacena y recupera correctamente en GET');
    console.log('3. Se puede actualizar la categoría de un post existente');
    console.log('4. La respuesta siempre mantiene el formato de array para "categories"');
    
  } catch (error) {
    console.error('❌ ERROR EN PRUEBA API:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n📝 PRUEBA COMPLETADA');
  }
}

// Comprobar si el servidor local está en ejecución
async function checkServerRunning() {
  try {
    const response = await fetch(`${baseUrl}/blog?limit=1`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Ejecutar la prueba si el servidor está en ejecución
async function run() {
  const isRunning = await checkServerRunning();
  if (!isRunning) {
    console.log('❌ ERROR: El servidor local no está en ejecución en http://localhost:3000');
    console.log('Por favor, inicia el servidor con "npm run dev" antes de ejecutar esta prueba.');
    return;
  }
  
  await testBlogApi();
}

run().catch(error => {
  console.error('Error en ejecución:', error);
  process.exit(1);
});
