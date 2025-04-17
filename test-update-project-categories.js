// Script de prueba para verificar la actualización de categorías de un proyecto
// Ejecutar con: node test-update-project-categories.js

// ID de proyecto a actualizar - REEMPLAZAR con un ID válido
const PROJECT_ID = 'cuid575787'; // Proyecto: Nuevo proyecto de prueba
const CATEGORY_IDS = [
  'cm9lle4wv0000unx0i92w4rjb',  // Cat1
  'cm9llehbx0001unx09ceyolwr',  // Cat2
];

async function testUpdateCategories() {
  try {
    console.log(`\n📋 Intentando actualizar proyecto ${PROJECT_ID} con categorías: ${CATEGORY_IDS.join(', ')}`);
    
    // 1. Primero obtenemos el proyecto actual
    const getResponse = await fetch(`http://localhost:3000/api/portfolio/${PROJECT_ID}`);
    
    if (!getResponse.ok) {
      console.error(`❌ Error al obtener el proyecto: ${getResponse.status}`);
      console.error(await getResponse.text());
      return;
    }
    
    const project = await getResponse.json();
    console.log(`✅ Proyecto obtenido: ${project.title}`);
    console.log(`   Categorías actuales: ${JSON.stringify(project.categories.map(c => ({ id: c.id, name: c.name })))}`);
    
    // 2. Ahora actualizamos el proyecto con nuevas categorías
    const updateData = {
      title: project.title,
      slug: project.slug,
      content: project.content,
      excerpt: project.excerpt,
      coverImage: project.coverImage,
      additionalImageUrls: project.additionalImageUrls,
      displayType: project.displayType || 'GALLERY',
      status: project.status || 'DRAFT',
      featured: project.featured || false,
      authorDisplayName: project.authorDisplayName,
      // Esta es la parte clave - enviamos los nuevos IDs de categorías
      categories: CATEGORY_IDS
    };
    
    console.log(`\n🔄 Enviando actualización con datos: ${JSON.stringify(updateData, null, 2)}`);
    
    const updateResponse = await fetch(`http://localhost:3000/api/portfolio/${PROJECT_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!updateResponse.ok) {
      console.error(`❌ Error al actualizar el proyecto: ${updateResponse.status}`);
      console.error(await updateResponse.text());
      return;
    }
    
    console.log(`✅ Proyecto actualizado correctamente.`);
    
    // 3. Verificamos que las categorías se hayan actualizado
    const verifyResponse = await fetch(`http://localhost:3000/api/portfolio/${PROJECT_ID}`);
    const updatedProject = await verifyResponse.json();
    
    console.log(`\n🔍 Verificando categorías después de la actualización:`);
    console.log(`   Categorías actualizadas: ${JSON.stringify(updatedProject.categories.map(c => ({ id: c.id, name: c.name })))}`);
    
    // 4. Verificamos si las categorías coinciden con las que enviamos
    const categoryIds = updatedProject.categories.map(c => c.id);
    const allFound = CATEGORY_IDS.every(id => categoryIds.includes(id));
    const extraFound = categoryIds.some(id => !CATEGORY_IDS.includes(id));
    
    if (allFound && !extraFound) {
      console.log(`\n✅ ÉXITO: Todas las categorías se actualizaron correctamente!`);
    } else {
      console.log(`\n⚠️ ADVERTENCIA: Las categorías no coinciden exactamente con las enviadas:`);
      if (!allFound) {
        console.log(`   - Faltan categorías: ${CATEGORY_IDS.filter(id => !categoryIds.includes(id))}`);
      }
      if (extraFound) {
        console.log(`   - Categorías extra: ${categoryIds.filter(id => !CATEGORY_IDS.includes(id))}`);
      }
    }
    
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testUpdateCategories();
