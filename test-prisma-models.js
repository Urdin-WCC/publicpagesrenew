// Simple test script to check what models are available on the Prisma client
// Using ESM syntax
import prisma from './lib/prisma.js';

// If the above doesn't work, try:
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

async function testModels() {
  try {
    // List all properties on prisma
    console.log('Properties available on the prisma client:');
    for (const key of Object.keys(prisma)) {
      console.log(`- ${key}`);
    }
    
    // Check if lowercase models exist
    const hasProjLower = !!prisma.project;
    const hasCatLower = !!prisma.category;
    console.log('Has prisma.project?', hasProjLower);
    console.log('Has prisma.category?', hasCatLower);
    
    // Check if PascalCase models exist
    const hasProjUpper = !!prisma.Project;
    const hasCatUpper = !!prisma.Category;
    console.log('Has prisma.Project?', hasProjUpper);
    console.log('Has prisma.Category?', hasCatUpper);
    
    // Try accessing each model variant
    try {
      const projectsLower = await prisma.project.findMany({ take: 1 });
      console.log('prisma.project works, found', projectsLower.length, 'items');
    } catch (err) {
      console.log('Error with prisma.project:', err.message);
    }
    
    try {
      const projectsUpper = await prisma.Project.findMany({ take: 1 });
      console.log('prisma.Project works, found', projectsUpper.length, 'items');
    } catch (err) {
      console.log('Error with prisma.Project:', err.message);
    }
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testModels();
