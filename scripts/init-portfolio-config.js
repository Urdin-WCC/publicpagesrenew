// Script para inicializar la configuración del portfolio
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Inicializando configuración del portfolio...');

    // Configuración por defecto del portfolio
    const defaultPortfolioConfig = {
      projectsPerPage: 12,
      defaultDisplayType: 'GALLERY',
      showSidebarInList: true,
      showSidebarInProject: true,
      layoutMode: 'grid',
    };

    // Convertir la configuración a JSON string
    const portfolioConfigString = JSON.stringify(defaultPortfolioConfig);

    // Verificar si ya existe una configuración global
    const existingConfig = await prisma.globalConfig.findUnique({
      where: { id: 'global' },
    });

    if (existingConfig) {
      // Actualizar la configuración existente
      await prisma.globalConfig.update({
        where: { id: 'global' },
        data: {
          portfolioConfig: portfolioConfigString,
        },
      });
      console.log('Configuración del portfolio actualizada correctamente.');
    } else {
      // Crear una nueva configuración global
      await prisma.globalConfig.create({
        data: {
          id: 'global',
          siteName: 'Neurowitch',
          siteUrl: 'http://localhost:3000',
          maintenanceMode: false,
          portfolioConfig: portfolioConfigString,
        },
      });
      console.log('Configuración del portfolio creada correctamente.');
    }

    console.log('Configuración del portfolio inicializada correctamente.');
  } catch (error) {
    console.error('Error al inicializar la configuración del portfolio:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
