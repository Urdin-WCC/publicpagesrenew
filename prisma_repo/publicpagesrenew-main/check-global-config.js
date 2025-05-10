// Script to check the GlobalConfig table structure and data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("==== Checking GlobalConfig Table ====");

    // 1. Get all fields from GlobalConfig
    const result = await prisma.$queryRaw`
      SELECT * 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;

    if (!result || !result.length) {
      console.log("No 'global' record found in GlobalConfig table.");
      return;
    }

    // 2. Print all available fields and their types
    const config = result[0];
    console.log("\nAvailable fields in GlobalConfig:");
    
    Object.keys(config).forEach(key => {
      const value = config[key];
      const valueType = typeof value;
      const valuePreview = valueType === 'string' && value ? 
        (value.length > 50 ? `${value.substring(0, 47)}...` : value) : 
        String(value);
      
      console.log(`- ${key}: (${valueType}) ${valuePreview}`);
    });

    // 3. Check critical fields for public interface
    console.log("\nCritical fields for public interface:");
    
    const criticalFields = [
      'header', 'footer', 'sidebar', 
      'navigationMenu', 
      'defaultLightThemePresetId', 'defaultDarkThemePresetId', 
      'themeAssignments',
      'loadingSpinnerConfig', 'themeSwitcherConfig', 'stickyElementsConfig'
    ];
    
    criticalFields.forEach(field => {
      const value = config[field];
      const exists = value !== undefined && value !== null;
      const isEmptyString = typeof value === 'string' && value.trim() === '';
      
      console.log(`- ${field}: ${exists ? (isEmptyString ? 'Empty string ⚠️' : 'Exists ✅') : 'Missing ❌'}`);
      
      // Check JSON fields
      if (exists && typeof value === 'string' && !isEmptyString) {
        try {
          JSON.parse(value);
          console.log(`  └─ Valid JSON ✅`);
        } catch (e) {
          console.log(`  └─ Invalid JSON! ❌ Error: ${e.message}`);
        }
      }
    });

    // 4. Check theme presets
    console.log("\nTheme Presets:");
    const themes = await prisma.themePreset.findMany({
      select: { id: true, name: true }
    });
    
    if (themes.length === 0) {
      console.log("No theme presets found in database ❌");
    } else {
      console.log(`Found ${themes.length} theme presets ✅`);
      themes.forEach(theme => {
        console.log(`- ID: ${theme.id}, Name: ${theme.name}`);
      });
    }

  } catch (error) {
    console.error("Error checking GlobalConfig:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
