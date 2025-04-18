// Script que simula exactamente la llamada API que haría la interfaz de usuario
const fetch = require('node-fetch');

async function testBlogApiCalls() {
  console.log('\n🔍 PRUEBA DE LLAMADAS API DEL BLOG');
  
  try {
    // 1. Obtener un post existente para editar
    console.log('1. Obteniendo un post existente...');
    
    const postResponse = await fetch('http://localhost:3000/api/blog/cuid30133');
    if (!postResponse.ok) {
      throw new Error(`Error al obtener post: ${postResponse.statusText}`);
    }
    
    const post = await postResponse.json();
    console.log(`   ✅ Post obtenido: ${post.title} (${post.id})`);
    console.log(`   Categories recibidas: `, post.categories);
    console.log(`   CategoryIds raw: `, post.categoryIds);
    
    // 2. Obtener todas las categorías disponibles
    console.log('\n2. Obteniendo todas las categorías disponibles...');
    
    const categoriesResponse = await fetch('http://localhost:3000/api/blog/categories');
    if (!categoriesResponse.ok) {
      throw new Error(`Error al obtener categorías: ${categoriesResponse.statusText}`);
    }
    
    const categories = await categoriesResponse.json();
    console.log(`   ✅ Categorías obtenidas: ${categories.length}`);
    categories.forEach(cat => console.log(`   - ${cat.name} (${cat.id})`));
    
    // 3. Seleccionar algunas categorías (simular selección en UI)
    const selectedCategoryIds = categories.slice(0, 2).map(cat => cat.id); // Selecciona las primeras 2 categorías
    console.log('\n3. Categorías seleccionadas para actualizar:');
    selectedCategoryIds.forEach(id => {
      const cat = categories.find(c => c.id === id);
      console.log(`   - ${cat.name} (${id})`);
    });
    
    // 4. Simular la actualización del post con exactamente los datos que enviaría el frontend
    console.log('\n4. Simulando actualización de post con las categorías seleccionadas...');
    
    const updatePayload = {
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      coverImage: post.coverImage || '',
      status: post.status,
      featured: post.featured || false,
      categories: selectedCategoryIds, // Aquí enviamos los IDs como un array
      authorDisplayName: post.authorDisplayName || '',
    };
    
    console.log('   Payload a enviar:');
    console.log(JSON.stringify(updatePayload, null, 2));
    
    const updateResponse = await fetch(`http://localhost:3000/api/blog/${post.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`Error al actualizar post: ${errorData.message || updateResponse.statusText}`);
    }
    
    const updatedPost = await updateResponse.json();
    console.log('\n   ✅ Post actualizado correctamente');
    console.log('   Categories después de actualizar: ', updatedPost.categories);
    console.log('   CategoryIds raw después de actualizar: ', updatedPost.categoryIds);
    
    // 5. Verificar que las categorías se hayan guardado correctamente
    console.log('\n5. Verificando que las categorías se hayan guardado...');
    
    const verifyResponse = await fetch(`http://localhost:3000/api/blog/${post.id}`);
    if (!verifyResponse.ok) {
      throw new Error(`Error al verificar post: ${verifyResponse.statusText}`);
    }
    
    const verifiedPost = await verifyResponse.json();
    console.log(`   Categories al verificar: `, verifiedPost.categories);
    console.log(`   CategoryIds raw al verificar: `, verifiedPost.categoryIds);
    
    const savedCategoryIds = verifiedPost.categories.map(cat => cat.id);
    const allSaved = selectedCategoryIds.every(id => savedCategoryIds.includes(id));
    const correctCount = selectedCategoryIds.length === savedCategoryIds.length;
    
    if (allSaved && correctCount) {
      console.log('   ✅ Todas las categorías se guardaron correctamente');
    } else {
      console.log('   ❌ Las categorías no se guardaron correctamente:');
      console.log(`   - Categorías seleccionadas: ${selectedCategoryIds.join(', ')}`);
      console.log(`   - Categorías guardadas: ${savedCategoryIds.join(', ')}`);
    }
  
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    console.log('\n📝 PRUEBA FINALIZADA');
  }
}

testBlogApiCalls().catch(console.error);
