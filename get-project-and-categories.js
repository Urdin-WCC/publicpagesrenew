// Script para obtener un proyecto y las categorías disponibles
// Ejecutar con: node get-project-and-categories.js

async function getProjectsAndCategories() {
  try {
    console.log('\n🔍 Obteniendo proyectos...');
    
    // 1. Obtener lista de proyectos
    const projectsResponse = await fetch('http://localhost:3000/api/portfolio?limit=5');
    if (!projectsResponse.ok) {
      throw new Error(`Error obteniendo proyectos: ${projectsResponse.status}`);
    }
    const projectsData = await projectsResponse.json();
    
    if (!projectsData.projects || projectsData.projects.length === 0) {
      console.log('⚠️ No hay proyectos disponibles.');
    } else {
      console.log(`✅ ${projectsData.projects.length} proyectos encontrados:`);
      projectsData.projects.forEach((project, index) => {
        console.log(`   ${index + 1}. ID: ${project.id} - "${project.title}"`);
        if (project.categories && project.categories.length > 0) {
          console.log(`      Categorías: ${project.categories.map(c => c.name).join(', ')}`);
        } else {
          console.log(`      Sin categorías asignadas`);
        }
      });
      
      // Guardar el primer ID de proyecto para uso posterior
      const firstProjectId = projectsData.projects[0]?.id;
      
      // 2. Obtener listado de categorías
      console.log('\n🔍 Obteniendo categorías disponibles...');
      const categoriesResponse = await fetch('http://localhost:3000/api/blog/categories');
      
      if (!categoriesResponse.ok) {
        throw new Error(`Error obteniendo categorías: ${categoriesResponse.status}`);
      }
      
      const categories = await categoriesResponse.json();
      
      if (!categories || categories.length === 0) {
        console.log('⚠️ No hay categorías disponibles.');
      } else {
        console.log(`✅ ${categories.length} categorías encontradas:`);
        categories.forEach((category, index) => {
          console.log(`   ${index + 1}. ID: ${category.id} - "${category.name}"`);
        });
        
        // Generar código de ejemplo para usar en el script de prueba
        console.log('\n📋 Código para copiar en test-update-project-categories.js:');
        console.log(`const PROJECT_ID = '${firstProjectId}'; // Proyecto: ${projectsData.projects[0]?.title}`);
        console.log('const CATEGORY_IDS = [');
        categories.slice(0, 2).forEach(category => {
          console.log(`  '${category.id}',  // ${category.name}`);
        });
        console.log('];');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar la función
getProjectsAndCategories();
