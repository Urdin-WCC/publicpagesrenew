// Script para analizar los caracteres individuales del JSON
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Analizando caracteres del JSON del menú de navegación...");
    
    // Obtener valor actual
    const result = await prisma.$queryRaw`
      SELECT navigationMenu 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!result || !result.length || !result[0].navigationMenu) {
      console.log("No se encontró el menú de navegación en la base de datos.");
      return;
    }
    
    const navigationMenuRaw = result[0].navigationMenu;
    
    // Mostrar el valor original para referencia
    console.log("\nJSON original:");
    console.log(navigationMenuRaw);
    
    // Analizar caracteres uno por uno
    console.log("\nAnálisis de caracteres (código ASCII):");
    console.log("Índice | Caracter | Código | Hex    | Descripción");
    console.log("------------------------------------------------");
    
    for (let i = 0; i < navigationMenuRaw.length; i++) {
      const char = navigationMenuRaw.charAt(i);
      const code = navigationMenuRaw.charCodeAt(i);
      const hex = code.toString(16).padStart(4, '0');
      
      let description = '';
      
      // Dar descripciones para caracteres especiales
      if (code === 123) description = 'Llave apertura {';
      if (code === 125) description = 'Llave cierre }';
      if (code === 91) description = 'Corchete apertura [';
      if (code === 93) description = 'Corchete cierre ]';
      if (code === 34) description = 'Comilla doble "';
      if (code === 58) description = 'Dos puntos :';
      if (code === 44) description = 'COMA ,';
      if (code === 92) description = 'Barra invertida \\';
      
      // Si el código está en el rango de control no imprimible
      if (code < 32 || (code >= 127 && code <= 159)) {
        description += ' [CONTROL]';
      }
      
      console.log(`${i.toString().padStart(6, ' ')} | ${char.padEnd(8)} | ${code.toString().padStart(5)} | 0x${hex} | ${description}`);
    }
    
    // Buscar secuencias clave
    console.log("\nAnálisis de secuencias clave:");
    const commaFound = navigationMenuRaw.includes(',');
    const objectCommaFound = navigationMenuRaw.includes('},{');
    const fieldCommaFound = navigationMenuRaw.includes('","');
    
    console.log(`Contiene comas (,): ${commaFound ? 'SÍ ✅' : 'NO ❌'}`);
    console.log(`Contiene secuencia '},{ (comas entre objetos): ${objectCommaFound ? 'SÍ ✅' : 'NO ❌'}`);
    console.log(`Contiene secuencia '","' (comas entre campos): ${fieldCommaFound ? 'SÍ ✅' : 'NO ❌'}`);

    // Crear un nuevo JSON completamente de prueba
    console.log("\nCreando JSON completamente nuevo para prueba...");
    const testJson = `[{"test":"value1","test2":"value2"},{"test":"value3","test2":"value4"}]`;
    
    console.log("JSON de prueba:");
    console.log(testJson);
    
    // También analizar caracteres del JSON de prueba para comparar
    console.log("\nAnálisis de caracteres del JSON de prueba:");
    console.log("Índice | Caracter | Código | Hex    | Descripción");
    console.log("------------------------------------------------");
    
    for (let i = 0; i < testJson.length; i++) {
      const char = testJson.charAt(i);
      const code = testJson.charCodeAt(i);
      const hex = code.toString(16).padStart(4, '0');
      
      let description = '';
      
      if (code === 123) description = 'Llave apertura {';
      if (code === 125) description = 'Llave cierre }';
      if (code === 91) description = 'Corchete apertura [';
      if (code === 93) description = 'Corchete cierre ]';
      if (code === 34) description = 'Comilla doble "';
      if (code === 58) description = 'Dos puntos :';
      if (code === 44) description = 'COMA ,';
      if (code === 92) description = 'Barra invertida \\';
      
      if (code < 32 || (code >= 127 && code <= 159)) {
        description += ' [CONTROL]';
      }
      
      console.log(`${i.toString().padStart(6, ' ')} | ${char.padEnd(8)} | ${code.toString().padStart(5)} | 0x${hex} | ${description}`);
    }
  } catch (error) {
    console.error("Error al analizar el JSON:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
