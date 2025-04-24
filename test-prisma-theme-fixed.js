const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Starting test with direct SQL...")
    let lightThemeId = null;
    
    // Create a test theme using direct SQL
    try {
      // First check if a test theme already exists
      const existingResult = await prisma.$queryRaw`
        SELECT id, name FROM ThemePreset
        WHERE name = 'Test Light Theme'
        LIMIT 1
      `;
      
      if (Array.isArray(existingResult) && existingResult.length > 0) {
        console.log('Test theme already exists:', existingResult[0]);
        lightThemeId = existingResult[0].id;
      } else {
        // Create a new test theme
        const insertResult = await prisma.$executeRawUnsafe(`
          INSERT INTO ThemePreset (name, config)
          VALUES ('Test Light Theme', '{"--background":"#ffffff"}')
        `);
        
        console.log('Theme created, affected rows:', insertResult);
        
        // Get the ID of the newly created theme
        const newThemeResult = await prisma.$queryRaw`
          SELECT id, name FROM ThemePreset
          WHERE name = 'Test Light Theme'
          LIMIT 1
        `;
        
        if (Array.isArray(newThemeResult) && newThemeResult.length > 0) {
          console.log('Created ThemePreset:', newThemeResult[0]);
          lightThemeId = newThemeResult[0].id;
        }
      }
      
      if (!lightThemeId) {
        throw new Error("Failed to get theme ID");
      }
      
      // Update GlobalConfig using direct SQL
      console.log('Updating GlobalConfig...');
      
      // First check if global config exists
      const configExists = await prisma.$queryRaw`
        SELECT id FROM GlobalConfig
        WHERE id = 'global'
        LIMIT 1
      `;
      
      if (Array.isArray(configExists) && configExists.length > 0) {
        // Update existing config
        await prisma.$executeRawUnsafe(`
          UPDATE GlobalConfig
          SET 
            defaultLightThemePresetId = ${lightThemeId},
            themeAssignments = '{}',
            loadingSpinnerConfig = '{"enabled":false}',
            themeSwitcherConfig = '{"enabled":true}',
            stickyElementsConfig = '{"header":false}'
          WHERE id = 'global'
        `);
        
        console.log('GlobalConfig updated successfully');
      } else {
        // Create global config if it doesn't exist
        await prisma.$executeRawUnsafe(`
          INSERT INTO GlobalConfig (
            id, siteName, siteUrl, 
            defaultLightThemePresetId, 
            themeAssignments, loadingSpinnerConfig, 
            themeSwitcherConfig, stickyElementsConfig
          )
          VALUES (
            'global', 'Neurowitch', 'http://localhost:3000',
            ${lightThemeId},
            '{}', '{"enabled":false}', 
            '{"enabled":true}', '{"header":false}'
          )
        `);
        
        console.log('GlobalConfig created successfully');
      }
      
      // Get the updated GlobalConfig
      const config = await prisma.$queryRaw`
        SELECT id, siteName, defaultLightThemePresetId
        FROM GlobalConfig
        WHERE id = 'global'
      `;
      
      console.log('Updated GlobalConfig:', config[0]);
      
      // Clean up (optionally, comment this out if you want to keep the test theme)
      await prisma.$executeRawUnsafe(`
        DELETE FROM ThemePreset
        WHERE id = ${lightThemeId}
      `);
      
      console.log('Test completed successfully and cleaned up');
    } catch (sqlError) {
      console.error('SQL Error:', sqlError);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
