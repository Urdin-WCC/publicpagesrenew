// test-project-api.js - Script for testing the portfolio API
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testProjectApi() {
  try {
    console.log("Testing Project API...");

    // 1. Test Direct SQL query to verify database access
    console.log("\n1. Testing direct SQL query to see if Project table exists:");
    try {
      const result = await prisma.$queryRaw`SHOW TABLES`;
      console.log("Database tables:", result);
      
      const projectTableExists = await prisma.$queryRaw`
        SELECT * FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'Project'
      `;
      console.log("Project table exists:", projectTableExists.length > 0);
    } catch (error) {
      console.error("Error querying database tables:", error);
    }

    // 2. Try to fetch all projects using direct SQL
    console.log("\n2. Testing project retrieval with direct SQL:");
    try {
      const projects = await prisma.$queryRaw`
        SELECT * FROM Project 
        WHERE deleted = false 
        LIMIT 5
      `;
      console.log(`Found ${projects.length} projects:`, 
        projects.map(p => ({id: p.id, title: p.title, slug: p.slug})));
    } catch (error) {
      console.error("Error retrieving projects with direct SQL:", error);
    }

    // 3. Try to create a test project with direct SQL
    console.log("\n3. Testing project creation with direct SQL:");
    try {
      const title = `Test Project ${Date.now()}`;
      const slug = `test-project-${Date.now()}`;
      
      // Generate a cuid-style ID (you might want to use an actual cuid library in production)
      const projectId = `cuid${Math.floor(Math.random() * 1000000)}`;
      
      const newProject = await prisma.$executeRaw`
        INSERT INTO Project (
          id,
          title, 
          slug, 
          content, 
          status,
          deleted,
          createdAt,
          updatedAt
        ) VALUES (
          ${projectId},
          ${title},
          ${slug},
          'This is a test project content.',
          'DRAFT',
          false,
          NOW(),
          NOW()
        )
      `;
      
      console.log("Project created successfully:", newProject);
      
      // Fetch the newly created project
      const project = await prisma.$queryRaw`
        SELECT * FROM Project 
        WHERE slug = ${slug}
      `;
      
      console.log("Retrieved created project:", 
        project.map(p => ({id: p.id, title: p.title, slug: p.slug})));
    } catch (error) {
      console.error("Error creating project with direct SQL:", error);
    }

  } catch (error) {
    console.error("Top level error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testProjectApi().catch(e => {
  console.error("Script error:", e);
  process.exit(1);
});
