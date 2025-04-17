// Script para verificar los campos disponibles en el modelo GlobalConfig
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Verificando campos disponibles en el modelo GlobalConfig...');

    // Obtener un registro existente
    const globalConfig = await prisma.globalConfig.findUnique({
      where: { id: 'global' },
    });

    if (globalConfig) {
      console.log('Campos disponibles en el modelo GlobalConfig:');
      console.log(Object.keys(globalConfig));
      console.log('\nValores:');
      console.log(globalConfig);
    } else {
      console.log('No se encontró ningún registro en la tabla GlobalConfig.');
    }
  } catch (error) {
    console.error('Error al verificar los campos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
