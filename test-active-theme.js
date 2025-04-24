const { PrismaClient } = require('@prisma/client')
const { getActiveTheme, getGlobalConfig } = require('./lib/config.ts')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Testing getGlobalConfig()...")
    const globalConfig = await getGlobalConfig();
    console.log("GlobalConfig:", {
      id: globalConfig.id,
      siteName: globalConfig.siteName,
      // Safely log theme IDs with casting
      defaultLightThemePresetId: (globalConfig?.defaultLightThemePresetId || 'not set'),
      defaultDarkThemePresetId: (globalConfig?.defaultDarkThemePresetId || 'not set')
    });
    
    console.log("\nTesting getActiveTheme()...")
    const activeTheme = await getActiveTheme();
    if (activeTheme) {
      console.log("Active Theme:", {
        id: activeTheme.id,
        name: activeTheme.name,
        // Show a small sample of the config
        configPreview: typeof activeTheme.config === 'string' 
          ? `${activeTheme.config.substring(0, 50)}...` 
          : 'Invalid config format'
      });
    } else {
      console.log("No active theme found");
    }
    
    console.log("\nTest completed successfully");
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
