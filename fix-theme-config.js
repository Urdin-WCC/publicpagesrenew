const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Starting theme configuration repair script...")
    
    // First, get all available themes
    const themes = await prisma.$queryRaw`
      SELECT id, name FROM ThemePreset ORDER BY id ASC
    `;
    
    console.log(`Found ${themes.length} themes in the database`);
    if (themes.length > 0) {
      themes.forEach(theme => console.log(` - Theme ${theme.id}: ${theme.name}`));
    }
    
    // Get current GlobalConfig
    const globalConfig = await prisma.$queryRaw`
      SELECT 
        id, siteName, defaultLightThemePresetId, defaultDarkThemePresetId
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (!globalConfig.length) {
      console.log("No GlobalConfig found, nothing to fix");
      return;
    }
    
    console.log("\nCurrent GlobalConfig theme settings:");
    console.log(` - defaultLightThemePresetId: ${globalConfig[0].defaultLightThemePresetId || 'not set'}`);
    console.log(` - defaultDarkThemePresetId: ${globalConfig[0].defaultDarkThemePresetId || 'not set'}`);
    
    // Check if the theme IDs exist
    let lightThemeValid = false;
    let darkThemeValid = false;
    let lightThemeId = null;
    let darkThemeId = null;
    
    if (globalConfig[0].defaultLightThemePresetId) {
      lightThemeValid = themes.some(t => t.id === globalConfig[0].defaultLightThemePresetId);
      if (lightThemeValid) {
        lightThemeId = globalConfig[0].defaultLightThemePresetId;
      }
    }
    
    if (globalConfig[0].defaultDarkThemePresetId) {
      darkThemeValid = themes.some(t => t.id === globalConfig[0].defaultDarkThemePresetId);
      if (darkThemeValid) {
        darkThemeId = globalConfig[0].defaultDarkThemePresetId;
      }
    }
    
    // If invalid, update with first available theme or null
    if (!lightThemeValid) {
      console.log("Light theme ID is invalid!");
      if (themes.length > 0) {
        lightThemeId = themes[0].id;
        console.log(`Setting light theme to ID ${lightThemeId} (${themes[0].name})`);
      } else {
        lightThemeId = null;
        console.log("Setting light theme to null (no themes available)");
      }
    }
    
    if (!darkThemeValid) {
      console.log("Dark theme ID is invalid!");
      if (themes.length > 1) {
        // Use second theme if available, otherwise use the same as light
        darkThemeId = themes[1] ? themes[1].id : lightThemeId;
        const themeName = themes.find(t => t.id === darkThemeId)?.name;
        console.log(`Setting dark theme to ID ${darkThemeId} (${themeName})`);
      } else if (themes.length > 0) {
        // Use the same theme as light
        darkThemeId = lightThemeId;
        console.log(`Setting dark theme to same as light: ID ${darkThemeId}`);
      } else {
        darkThemeId = null;
        console.log("Setting dark theme to null (no themes available)");
      }
    }
    
    // Update GlobalConfig
    if (!lightThemeValid || !darkThemeValid) {
      console.log("\nUpdating GlobalConfig...");
      
      // Safely handle null values in SQL
      const lightThemeParam = lightThemeId === null ? 'NULL' : lightThemeId;
      const darkThemeParam = darkThemeId === null ? 'NULL' : darkThemeId;
      
      // Use raw SQL to handle null values properly
      const updateQuery = `
        UPDATE GlobalConfig
        SET 
          defaultLightThemePresetId = ${lightThemeParam},
          defaultDarkThemePresetId = ${darkThemeParam}
        WHERE id = 'global'
      `;
      
      await prisma.$executeRawUnsafe(updateQuery);
      console.log("GlobalConfig updated successfully");
      
      // Verify the update
      const updatedConfig = await prisma.$queryRaw`
        SELECT defaultLightThemePresetId, defaultDarkThemePresetId
        FROM GlobalConfig
        WHERE id = 'global'
      `;
      
      console.log("\nUpdated GlobalConfig theme settings:");
      console.log(` - defaultLightThemePresetId: ${updatedConfig[0].defaultLightThemePresetId || 'null'}`);
      console.log(` - defaultDarkThemePresetId: ${updatedConfig[0].defaultDarkThemePresetId || 'null'}`);
    } else {
      console.log("\nNo updates needed - theme configuration is valid");
    }
    
    console.log("\nRepair script completed!");
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
  });
