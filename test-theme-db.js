const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Testing theme database functions directly...")
    
    // Get GlobalConfig
    console.log("Fetching GlobalConfig...")
    const globalConfig = await prisma.$queryRaw`
      SELECT 
        id, siteName, defaultLightThemePresetId, defaultDarkThemePresetId,
        themeAssignments, loadingSpinnerConfig, 
        themeSwitcherConfig, stickyElementsConfig
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    console.log("GlobalConfig:", globalConfig.length ? {
      id: globalConfig[0].id,
      siteName: globalConfig[0].siteName,
      defaultLightThemePresetId: globalConfig[0].defaultLightThemePresetId || 'not set',
      defaultDarkThemePresetId: globalConfig[0].defaultDarkThemePresetId || 'not set'
    } : "No GlobalConfig found");
    
    // Get theme information if defaultLightThemePresetId is set
    if (globalConfig.length && globalConfig[0].defaultLightThemePresetId) {
      console.log("\nFetching active theme...")
      const themeId = globalConfig[0].defaultLightThemePresetId;
      
      const themeResult = await prisma.$queryRaw`
        SELECT id, name, config 
        FROM ThemePreset 
        WHERE id = ${themeId}
      `;
      
      if (themeResult.length > 0) {
        const theme = themeResult[0];
        console.log("Active Theme:", {
          id: theme.id,
          name: theme.name,
          configPreview: typeof theme.config === 'string' 
            ? `${theme.config.substring(0, 100)}...` 
            : 'Invalid config format'
        });
      } else {
        console.log("No theme found with ID", themeId);
      }
    } else {
      console.log("\nNo default light theme set, checking for any theme...")
      
      // If no theme ID in GlobalConfig, fetch any theme
      const anyTheme = await prisma.$queryRaw`
        SELECT id, name, config 
        FROM ThemePreset 
        ORDER BY id ASC 
        LIMIT 1
      `;
      
      if (anyTheme.length > 0) {
        console.log("Found theme:", {
          id: anyTheme[0].id,
          name: anyTheme[0].name,
          configPreview: typeof anyTheme[0].config === 'string' 
            ? `${anyTheme[0].config.substring(0, 100)}...` 
            : 'Invalid config format'
        });
      } else {
        console.log("No themes found in the database");
      }
    }
    
    console.log("\nTest completed successfully!");
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
