// Script para probar la creación de un proyecto con categorías utilizando JSON
// Ejecutar con: node test-create-project.js

// Este script demuestra cómo crear un proyecto de prueba mientras estamos logueados en la aplicación
// Para usar en un entorno real, necesitaríamos estar autenticados

const fetch = require('node-fetch');

async function createTestProject() {
  console.log('🧪 Creando proyecto de prueba con categorías');

  try {
    // 1. Primero obtenemos categorías disponibles para usarlas en el proyecto
    const categoriesResponse = await fetch('http://localhost:3000/api/blog/categories');
    
    if (!categoriesResponse.ok) {
      throw new Error(`Error obteniendo categorías: ${categoriesResponse.status}`);
    }
    
    const categories = await categoriesResponse.json();
    
    if (!categories || categories.length === 0) {
      console.log('❌ No hay categorías disponibles. El test no puede continuar.');
      return;
    }
    
    console.log(`✅ Encontradas ${categories.length} categorías para usar en el proyecto`);
    console.log('   Primeras 2 categorías:');
    categories.slice(0, 2).forEach((category, index) => {
      console.log(`   ${index + 1}. ${category.name} (ID: ${category.id})`);
    });
    
    // Seleccionar las primeras 2 categorías (o 1 si solo hay una)
    const selectedCategoryIds = categories.slice(0, Math.min(2, categories.length)).map(c => c.id);
    
    // 2. Crear el proyecto de prueba con las categorías seleccionadas
    const projectData = {
      title: `Proyecto de prueba JSON ${new Date().toISOString().slice(0, 16)}`,
      slug: `proyecto-prueba-json-${Date.now()}`,
      content: '<p>Este es un proyecto de prueba creado para verificar la funcionalidad de categorías con JSON</p>',
      excerpt: 'Proyecto de prueba para categorías JSON',
      displayType: 'GALLERY',
      status: 'PUBLISHED',  // Puede requerir permisos adecuados
      featured: true,
      categories: selectedCategoryIds  // Usamos los IDs de las categorías seleccionadas
    };
    
    console.log('📝 Datos del proyecto a crear:');
    console.log(JSON.stringify(projectData, null, 2));
    
    console.log('🔄 Enviando solicitud para crear proyecto...');
    console.log('   NOTA: Este script NO podrá crear el proyecto a menos que estés autenticado');
    console.log('   Te sugerimos usar estos datos para crear el proyecto manualmente desde la interfaz');
    
    const projectResponse = await fetch('http://localhost:3000/api/portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    });
    
    if (projectResponse.ok) {
      const newProject = await projectResponse.json();
      console.log('✅ Proyecto creado correctamente:');
      console.log(`   ID: ${newProject.id}`);
      console.log(`   Título: ${newProject.title}`);
      console.log(`   Categorías: ${JSON.stringify(newProject.categories)}`);
    } else {
      const errorData = await projectResponse.json();
      console.log('❌ Error al crear proyecto:');
      console.log(`   Estado: ${projectResponse.status}`);
      console.log(`   Mensaje: ${errorData.message || 'Sin mensaje de error'}`);
      console.log('   Es probable que necesites estar autenticado. Intenta crear el proyecto manualmente.');
    }
  } catch (error) {
    console.error('❌ Error durante la ejecución:', error);
  }
}

// Ejecutar la función
createTestProject();
