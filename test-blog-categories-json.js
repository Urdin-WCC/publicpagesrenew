// Script para probar específicamente el formateo JSON de categorías
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testJsonFormatting() {
  console.log('\n🔍 PRUEBA DE FORMATEO JSON DE CATEGORÍAS');
  
  try {
    // 1. Obtener categorías disponibles
    console.log('1. Obteniendo categorías disponibles...');
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      take: 2,
    });
    
    console.log(`   ✅ Usando categorías:`);
    categories.forEach(cat => console.log(`   - ${cat.name} (${cat.id})`));

    // 2. Crear un post de prueba para pruebas
    console.log('\n2. Creando un post de prueba...');
    const testPostId = `test_post_${Date.now()}`;
    
    await prisma.$executeRaw`
      INSERT INTO Post (
        id, title, slug, content, status, authorDisplayName,
        createdAt, updatedAt, deleted, featured
      )
      VALUES (
        ${testPostId}, 
        ${'Test JSON Formatting'}, 
        ${'test-json-formatting'}, 
        ${'Test content'}, 
        ${'DRAFT'}, 
        ${'Test Author'},
        CURRENT_TIMESTAMP(),
        CURRENT_TIMESTAMP(),
        FALSE,
        FALSE
      )
    `;
    
    console.log(`   ✅ Post creado con ID: ${testPostId}`);
    
    // 3. Probar varias formas de formatear las categorías
    const categoryIds = categories.map(c => c.id);
    console.log('\n3. Probando diferentes formatos JSON...');
    
    // Formato 1: Arreglo de strings
    const format1 = JSON.stringify(categoryIds);
    console.log(`   Formato 1 (array de strings): ${format1}`);
    
    // Formato 2: Array de objetos con id
    const format2 = JSON.stringify(categoryIds.map(id => ({ id })));
    console.log(`   Formato 2 (array de objetos): ${format2}`);
    
    // Formato 3: String sin escape
    const format3 = `[${categoryIds.map(id => `"${id}"`).join(',')}]`;
    console.log(`   Formato 3 (string manual): ${format3}`);
    
    // 4. Intentar actualizar con cada formato
    console.log('\n4. Probando actualización con diferentes formatos...');
    
    // Probar exactamente la misma lógica que en la API
    const categoryIdsJson = JSON.stringify(categoryIds.filter(Boolean));
    
    console.log(`   Intentando actualizar con: ${categoryIdsJson}`);
    
    // Revisemos primero si hay caracteres especiales
    console.log('   Analizando posibles problemas en el JSON:');
    for (let i = 0; i < categoryIdsJson.length; i++) {
      const char = categoryIdsJson[i];
      const code = categoryIdsJson.charCodeAt(i);
      if (code < 32 || code > 126 || char === '\\' || char === '"') {
        console.log(`   - Carácter potencialmente problemático en pos ${i}: "${char}" (${code})`);
      }
    }
    
    // Actualizar con la misma lógica de la API pero con un JSON bien formateado
    try {
      await prisma.$executeRaw`
        UPDATE Post
        SET 
          categoryIds = ${categoryIdsJson}
        WHERE id = ${testPostId}
      `;
      console.log('   ✅ Actualización 1 completada');
    } catch (error) {
      console.log(`   ❌ Error en actualización 1: ${error.message}`);
    }
    
    // Verificar si se guardó correctamente
    const post1 = await prisma.post.findUnique({
      where: { id: testPostId },
    });
    
    console.log(`   Resultado 1 - categoryIds: "${post1.categoryIds}"`);
    
    // Intentar con un formato más simple
    try {
      await prisma.$executeRaw`
        UPDATE Post
        SET 
          categoryIds = ${format3}
        WHERE id = ${testPostId}
      `;
      console.log('   ✅ Actualización 2 completada');
    } catch (error) {
      console.log(`   ❌ Error en actualización 2: ${error.message}`);
    }
    
    // Verificar si se guardó correctamente
    const post2 = await prisma.post.findUnique({
      where: { id: testPostId },
    });
    
    console.log(`   Resultado 2 - categoryIds: "${post2.categoryIds}"`);
    
    // Probar insertando el JSON directamente como string literal con comillas
    try {
      const stringCategoryIds = `'${categoryIdsJson}'`;
      console.log(`   Intentando con string literal: ${stringCategoryIds}`);
      
      await prisma.$executeRaw`
        UPDATE Post
        SET categoryIds = ${categoryIdsJson}
        WHERE id = ${testPostId}
      `;
      console.log('   ✅ Actualización 3 completada');
    } catch (error) {
      console.log(`   ❌ Error en actualización 3: ${error.message}`);
    }
    
    // Verificar de nuevo
    const post3 = await prisma.post.findUnique({
      where: { id: testPostId },
    });
    
    console.log(`   Resultado 3 - categoryIds: "${post3.categoryIds}"`);
    
    // Probar insertando simplemente un texto de prueba para ver si la columna se puede actualizar en absoluto
    try {
      await prisma.$executeRaw`
        UPDATE Post
        SET categoryIds = ${'["test1","test2"]'}
        WHERE id = ${testPostId}
      `;
      console.log('   ✅ Actualización 4 completada');
    } catch (error) {
      console.log(`   ❌ Error en actualización 4: ${error.message}`);
    }
    
    // Verificar de nuevo
    const post4 = await prisma.post.findUnique({
      where: { id: testPostId },
    });
    
    console.log(`   Resultado 4 - categoryIds: "${post4.categoryIds}"`);
    
    // Intentar con prepared statements
    try {
      const rawJSON = JSON.stringify(categoryIds);
      console.log(`   Intentando con prepared statement: ${rawJSON}`);
      
      // Como último recurso, probar con una consulta preparada
      await prisma.$queryRawUnsafe(
        `UPDATE Post SET categoryIds = ? WHERE id = ?`,
        rawJSON,
        testPostId
      );
      console.log('   ✅ Actualización 5 completada');
    } catch (error) {
      console.log(`   ❌ Error en actualización 5: ${error.message}`);
    }
    
    // Verificar una última vez
    const post5 = await prisma.post.findUnique({
      where: { id: testPostId },
    });
    
    console.log(`   Resultado 5 - categoryIds: "${post5.categoryIds}"`);
    
    // Analizar resultados
    const successfulUpdates = [post1, post2, post3, post4, post5].filter(p => p.categoryIds).length;
    console.log(`\n   Actualizaciones exitosas: ${successfulUpdates} de 5 intentos`);
    
    if (successfulUpdates > 0) {
      console.log('   ✅ Al menos un método funcionó para actualizar categoryIds');
    } else {
      console.log('   ❌ Ningún método funcionó para actualizar categoryIds');
      console.log('   Esto sugiere un problema con el esquema de la base de datos');
    }
  
    // 7. Limpiar: Eliminar post de prueba
    try {
      console.log('\n7. Limpiando: Eliminando post de prueba...');
      await prisma.post.delete({
        where: { id: testPostId },
      });
      console.log('   ✅ Post de prueba eliminado correctamente');
    } catch (error) {
      console.log(`   ❌ Error al eliminar post: ${error.message}`);
      // Intentar con SQL directo como último recurso
      try {
        await prisma.$executeRaw`DELETE FROM Post WHERE id = ${testPostId}`;
        console.log('   ✅ Post eliminado con SQL directo');
      } catch (del2Error) {
        console.error('   ❌ No se pudo eliminar el post de prueba:', del2Error);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n📝 PRUEBA COMPLETADA');
  }
}

// Ejecutar la función
testJsonFormatting()
  .catch(error => {
    console.error('Error en la ejecución:', error);
    process.exit(1);
  });
