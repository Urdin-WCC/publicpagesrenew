// Script para ver el formato exacto de categoryIds en la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function viewCategoryIdsFormat() {
  console.log('\n🔍 COMPARANDO FORMATO DE categoryIds EN BLOG VS PORTFOLIO...');
  
  try {
    // Obtener un post y un proyecto para comparar
    console.log('1. Buscando un post con categorías...');
    const posts = await prisma.$queryRaw`
      SELECT id, title, categoryIds 
      FROM Post 
      WHERE categoryIds IS NOT NULL AND categoryIds != ''
      LIMIT 5
    `;
    
    if (posts.length === 0) {
      console.log('   ❌ No se encontraron posts con categorías.');
    } else {
      console.log(`   ✅ Encontrados ${posts.length} posts con categorías.`);
      
      // Mostrar el formato de categoryIds en los posts
      for (const post of posts) {
        console.log(`\nPost: ${post.title} (${post.id})`);
        console.log(`CategoryIds (raw): "${post.categoryIds}"`);
        console.log(`CategoryIds (type): ${typeof post.categoryIds}`);
        console.log(`CategoryIds (length): ${post.categoryIds.length}`);
        
        let parsedIds = null;
        try {
          parsedIds = JSON.parse(post.categoryIds);
          console.log(`Parsed successfully as JSON: ${typeof parsedIds} with ${parsedIds.length} items`);
          console.log(`Parsed content: ${JSON.stringify(parsedIds)}`);
        } catch (error) {
          console.log(`❌ Error parsing as JSON: ${error.message}`);
        }
        
        // Mostrar los primeros 5 caracteres en formato de códigos ASCII para depuración
        console.log('First 10 chars as ASCII codes:');
        for (let i = 0; i < Math.min(10, post.categoryIds.length); i++) {
          console.log(` - Char "${post.categoryIds[i]}": ${post.categoryIds.charCodeAt(i)}`);
        }
      }
    }
    
    // Obtener un proyecto con categorías para comparar
    console.log('\n2. Buscando un proyecto con categorías...');
    const projects = await prisma.$queryRaw`
      SELECT id, title, categoryIds 
      FROM Project 
      WHERE categoryIds IS NOT NULL AND categoryIds != ''
      LIMIT 5
    `;
    
    if (projects.length === 0) {
      console.log('   ❌ No se encontraron proyectos con categorías.');
    } else {
      console.log(`   ✅ Encontrados ${projects.length} proyectos con categorías.`);
      
      // Mostrar el formato de categoryIds en los proyectos
      for (const project of projects) {
        console.log(`\nProyecto: ${project.title} (${project.id})`);
        console.log(`CategoryIds (raw): "${project.categoryIds}"`);
        console.log(`CategoryIds (type): ${typeof project.categoryIds}`);
        console.log(`CategoryIds (length): ${project.categoryIds.length}`);
        
        let parsedIds = null;
        try {
          parsedIds = JSON.parse(project.categoryIds);
          console.log(`Parsed successfully as JSON: ${typeof parsedIds} with ${parsedIds.length} items`);
          console.log(`Parsed content: ${JSON.stringify(parsedIds)}`);
        } catch (error) {
          console.log(`❌ Error parsing as JSON: ${error.message}`);
        }
        
        // Mostrar los primeros 5 caracteres en formato de códigos ASCII para depuración
        console.log('First 10 chars as ASCII codes:');
        for (let i = 0; i < Math.min(10, project.categoryIds.length); i++) {
          console.log(` - Char "${project.categoryIds[i]}": ${project.categoryIds.charCodeAt(i)}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error al ejecutar el script:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n📝 ANÁLISIS COMPLETADO');
  }
}

// Ejecutar la función
viewCategoryIdsFormat()
  .catch(error => {
    console.error('Error en la ejecución:', error);
    process.exit(1);
  });
