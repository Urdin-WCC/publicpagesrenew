// Script para crear un proyecto directamente usando Prisma
const { PrismaClient } = require('@prisma/client');

async function createProject() {
  try {
    // Crear una instancia de PrismaClient
    const prisma = new PrismaClient();
    
    // Verificar si el cliente de Prisma tiene el modelo Project
    console.log('Modelos disponibles en PrismaClient:', Object.keys(prisma));
    
    // Intentar crear un proyecto
    const newProject = await prisma.project.create({
      data: {
        title: 'Proyecto de prueba',
        slug: 'proyecto-de-prueba-' + Date.now(),
        content: 'Contenido del proyecto de prueba',
        excerpt: 'Extracto del proyecto de prueba',
        displayType: 'SINGLE',
        status: 'PUBLISHED',
        featured: false,
        authorDisplayName: 'Admin',
        deleted: false,
      }
    });
    
    console.log('Proyecto creado con éxito:', newProject);
  } catch (error) {
    console.error('Error al crear el proyecto:', error);
  }
}

// Ejecutar la función
createProject();
