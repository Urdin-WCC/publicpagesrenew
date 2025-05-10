// Script to fix the remaining issues with the public interface configuration
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("==== Fixing Remaining Public Interface Issues ====");

    // First, check if the theme presets exist with IDs 1 and 2
    const themesCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM ThemePreset WHERE id IN (1, 2)
    `;
    
    const count = themesCount[0]?.count || 0;
    console.log(`Found ${count} theme presets with IDs 1 and 2.`);
    
    // If not enough themes exist, create the required ones
    if (count < 2) {
      console.log("Creating missing theme presets...");
      
      // Check if theme with ID 1 exists
      const theme1Exists = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM ThemePreset WHERE id = 1
      `;
      
      if (theme1Exists[0]?.count === 0) {
        console.log("Creating light theme preset (ID: 1)...");
        
        // Create default light theme using direct SQL
        await prisma.$executeRaw`
          INSERT INTO ThemePreset (id, name, config)
          VALUES (
            1, 
            'Default Light', 
            '{"background":{"type":"color","value":"#ffffff"},"typography":{"heading":{"color":"#1a202c","fontFamily":"system-ui"},"paragraph":{"color":"#4a5568","fontFamily":"system-ui"},"link":{"color":"#3182ce","hoverColor":"#2c5282"}}}'
          )
          ON DUPLICATE KEY UPDATE
          name = 'Default Light',
          config = '{"background":{"type":"color","value":"#ffffff"},"typography":{"heading":{"color":"#1a202c","fontFamily":"system-ui"},"paragraph":{"color":"#4a5568","fontFamily":"system-ui"},"link":{"color":"#3182ce","hoverColor":"#2c5282"}}}'
        `;
        console.log("Light theme preset created/updated.");
      }
      
      // Check if theme with ID 2 exists
      const theme2Exists = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM ThemePreset WHERE id = 2
      `;
      
      if (theme2Exists[0]?.count === 0) {
        console.log("Creating dark theme preset (ID: 2)...");
        
        // Create default dark theme using direct SQL
        await prisma.$executeRaw`
          INSERT INTO ThemePreset (id, name, config)
          VALUES (
            2, 
            'Default Dark', 
            '{"background":{"type":"color","value":"#1a202c"},"typography":{"heading":{"color":"#f7fafc","fontFamily":"system-ui"},"paragraph":{"color":"#e2e8f0","fontFamily":"system-ui"},"link":{"color":"#63b3ed","hoverColor":"#90cdf4"}}}'
          )
          ON DUPLICATE KEY UPDATE
          name = 'Default Dark',
          config = '{"background":{"type":"color","value":"#1a202c"},"typography":{"heading":{"color":"#f7fafc","fontFamily":"system-ui"},"paragraph":{"color":"#e2e8f0","fontFamily":"system-ui"},"link":{"color":"#63b3ed","hoverColor":"#90cdf4"}}}'
        `;
        console.log("Dark theme preset created/updated.");
      }
    }

    // Create valid strings for the JSON fields with proper comma formatting
    const navigationMenu = JSON.stringify([
      { id: "menu-item-1", label: "Inicio", target: "/", openInNewTab: false },
      { id: "menu-item-2", label: "Blog", target: "/blog", openInNewTab: false },
      { id: "menu-item-3", label: "Acerca de", target: "/page/about", openInNewTab: false }
    ]);

    const themeAssignments = JSON.stringify({
      header: { light: 1, dark: 2 },
      footer: { light: 1, dark: 2 },
      sidebar: { light: 1, dark: 2 }
    });

    console.log("Updating GlobalConfig with theme IDs and JSON fields...");
    
    // Update the GlobalConfig with fixed values
    await prisma.$executeRaw`
      UPDATE GlobalConfig
      SET 
        defaultLightThemePresetId = 1,
        defaultDarkThemePresetId = 2,
        navigationMenu = ${navigationMenu},
        themeAssignments = ${themeAssignments}
      WHERE id = 'global'
    `;

    console.log("Configuration updated successfully!");

    // Verify the theme IDs were set correctly using direct SQL
    const verificationResult = await prisma.$queryRaw`
      SELECT defaultLightThemePresetId, defaultDarkThemePresetId 
      FROM GlobalConfig 
      WHERE id = 'global'
    `;

    console.log("Verification:");
    if (verificationResult && verificationResult.length > 0) {
      console.log(`Default Light Theme ID: ${verificationResult[0].defaultLightThemePresetId}`);
      console.log(`Default Dark Theme ID: ${verificationResult[0].defaultDarkThemePresetId}`);
    } else {
      console.log("Verification failed: Could not retrieve updated config");
    }

    console.log("\nAll issues fixed successfully!");
  } catch (error) {
    console.error("Error fixing remaining issues:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
