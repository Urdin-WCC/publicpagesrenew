// Simple script to test project status querying
// Usage: node test-project-status.js

const { PrismaClient } = require('@prisma/client');

async function main() {
  try {
    const prisma = new PrismaClient();
    
    // Test query for published projects only (public-facing routes)
    const publishedQuery = `
      SELECT id, title, status, featured 
      FROM Project
      WHERE status = 'PUBLISHED' AND deleted = FALSE
      ORDER BY createdAt DESC
    `;
    
    // Test query for admin panel (all non-deleted projects)
    const allQuery = `
      SELECT id, title, status, featured 
      FROM Project
      WHERE deleted = FALSE
      ORDER BY status, createdAt DESC
    `;
    
    console.log('=== TESTING PROJECT STATUS QUERIES ===');
    
    // Get published projects
    console.log('\n=== PUBLISHED PROJECTS (public view) ===');
    const publishedProjects = await prisma.$queryRawUnsafe(publishedQuery);
    console.log(`Found ${publishedProjects.length} published projects:`);
    publishedProjects.forEach((project, index) => {
      console.log(`${index + 1}. [${project.status}] ${project.title} (${project.id})${project.featured ? ' ⭐' : ''}`);
    });
    
    // Get all projects (admin view)
    console.log('\n=== ALL PROJECTS (admin view) ===');
    const allProjects = await prisma.$queryRawUnsafe(allQuery);
    console.log(`Found ${allProjects.length} total projects:`);
    
    // Group by status for nicer display
    const byStatus = allProjects.reduce((acc, project) => {
      acc[project.status] = acc[project.status] || [];
      acc[project.status].push(project);
      return acc;
    }, {});
    
    // Display counts by status
    console.log('\n=== COUNTS BY STATUS ===');
    Object.entries(byStatus).forEach(([status, projects]) => {
      console.log(`${status}: ${projects.length} projects`);
    });
    
    // Display all projects
    console.log('\n=== ALL PROJECTS DETAILS ===');
    allProjects.forEach((project, index) => {
      console.log(`${index + 1}. [${project.status}] ${project.title} (${project.id})${project.featured ? ' ⭐' : ''}`);
    });
    
    // Check featured projects
    console.log('\n=== FEATURED PROJECTS ===');
    const featuredProjects = allProjects.filter(p => p.featured);
    console.log(`Found ${featuredProjects.length} featured projects:`);
    featuredProjects.forEach((project, index) => {
      console.log(`${index + 1}. [${project.status}] ${project.title} (${project.id}) ⭐`);
    });

    // Check featured AND published projects (for widgets)
    console.log('\n=== FEATURED AND PUBLISHED PROJECTS ===');
    const featuredPublishedProjects = publishedProjects.filter(p => p.featured);
    console.log(`Found ${featuredPublishedProjects.length} featured & published projects:`);
    featuredPublishedProjects.forEach((project, index) => {
      console.log(`${index + 1}. [${project.status}] ${project.title} (${project.id}) ⭐`);
    });
    
    await prisma.$disconnect();
    console.log('\n=== TEST COMPLETED ===');
    
  } catch (error) {
    console.error('Error testing projects:', error);
    process.exit(1);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
