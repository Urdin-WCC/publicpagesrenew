// Script para migrar las categorías de blog
// Ejecutar con: node migrate-blog-categories.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateBlogCategories() {
  console.log('\n🔄 MIGRANDO CATEGORÍAS DE BLOG A ENFOQUE JSON...');

  try {
    // 1. Obtener todos los posts
    console.log('1. Obteniendo todos los posts con sus categorías...');
    const posts = await prisma.post.findMany({
      include: {
        _count: {
          select: { categories: true }
        }
      }
    });
    
    console.log(`   ${posts.length} posts encontrados a procesar`);
    
    // Obtener los posts que tienen categorías
    const postsWithCategories = posts.filter(post => post._count.categories > 0);
    console.log(`   ${postsWithCategories.length} posts tienen categorías asignadas`);
    
    // 2. Para cada post con categorías, obtener las categorías y migrarlas
    console.log('2. Migrando categorías a formato JSON...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const post of postsWithCategories) {
      try {
        // Obtener categorías actuales (usando la relación)
        const categories = await prisma.$queryRaw`
          SELECT c.id
          FROM Category c
          JOIN _PostCategories pc ON c.id = pc.B
          WHERE pc.A = ${post.id}
        `;
        
        // Extraer los IDs de categorías
        const categoryIds = categories.map(cat => cat.id);
        
        // Guardar como JSON en el campo categoryIds
        if (categoryIds.length > 0) {
          const categoryIdsJson = JSON.stringify(categoryIds);
          
          await prisma.post.update({
            where: { id: post.id },
            data: { categoryIds: categoryIdsJson }
          });
          
          console.log(`   ✅ Post ID: ${post.id} migrado con ${categoryIds.length} categorías`);
          successCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error migrando post ${post.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 RESUMEN DE MIGRACIÓN:');
    console.log(`   Total de posts: ${posts.length}`);
    console.log(`   Posts con categorías: ${postsWithCategories.length}`);
    console.log(`   Posts migrados correctamente: ${successCount}`);
    console.log(`   Posts con errores: ${errorCount}`);
    
    // 3. Recomendaciones de uso
    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('• Las categorías han sido migradas al campo JSON categoryIds');
    console.log('• Las APIs del blog han sido actualizadas para usar este nuevo formato');
    console.log('• Puedes eliminar las tablas de relación de categorías y etiquetas una vez verificado el funcionamiento');
    
  } catch (error) {
    console.error('❌ Error general durante la migración:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n📝 OPERACIÓN COMPLETADA');
  }
}

// Ejecutar la función
migrateBlogCategories()
  .catch(error => {
    console.error('Error en la ejecución:', error);
    process.exit(1);
  });
