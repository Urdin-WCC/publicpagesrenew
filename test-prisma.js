// Simple script to test prisma models
const { prisma } = require('@/lib/prisma');

// If above doesn't work, try:
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

async function testPrisma() {
  try {
    console.log('Prisma Client:', prisma);
    console.log('Prisma Project model exists?', !!prisma.project);
    console.log('Prisma Project model (uppercase) exists?', !!prisma.Project);
    
    console.log('Prisma Category model exists?', !!prisma.category);
    console.log('Prisma Category model (uppercase) exists?', !!prisma.Category);

    // Try getting all projects
    try {
      const projects = await prisma.project.findMany();
      console.log('Projects count:', projects.length);
    } catch (err) {
      console.error('Error accessing prisma.project:', err);
    }

    // Try getting all projects with uppercase
    try {
      const projects = await prisma.Project.findMany();
      console.log('Projects count (uppercase):', projects.length);
    } catch (err) {
      console.error('Error accessing prisma.Project:', err);
    }

    // Try getting all categories
    try {
      const categories = await prisma.category.findMany();
      console.log('Categories count:', categories.length);
    } catch (err) {
      console.error('Error accessing prisma.category:', err);
    }

    // Try getting all categories with uppercase
    try {
      const categories = await prisma.Category.findMany();
      console.log('Categories count (uppercase):', categories.length);
    } catch (err) {
      console.error('Error accessing prisma.Category:', err);
    }

    // List all models available on prisma
    console.log('Available models on prisma:');
    for (const key of Object.keys(prisma)) {
      console.log('  -', key);
    }
    
  } catch (error) {
    console.error('Error testing Prisma:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
