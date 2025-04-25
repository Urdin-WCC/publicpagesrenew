// Script to fix the public interface configuration
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("==== Fixing Public Interface Configuration ====");

    // 1. Check if GlobalConfig with id='global' exists
    const existingConfig = await prisma.globalConfig.findUnique({
      where: { id: 'global' }
    });

    if (!existingConfig) {
      console.log("No 'global' record found. Creating one...");
      // Create basic global config if it doesn't exist
      await prisma.globalConfig.create({
        data: { 
          id: 'global',
          siteName: 'Neurowitch',
          siteUrl: 'https://neurowitch.com'
        }
      });
      console.log("Created basic GlobalConfig with id='global'");
    } else {
      console.log("Found existing GlobalConfig with id='global'");
    }

    // 2. Define default configurations for components
    const defaultHeader = JSON.stringify({
      elements: [
        { type: "logo", visible: true, position: "top-left" },
        { type: "text", visible: true, position: "top-center" },
        { type: "menu", visible: true, position: "top-right" },
        { type: "social", visible: true, position: "bottom-left" },
        { type: "theme", visible: true, position: "bottom-right" },
        { type: "html", visible: false, position: "center-center" }
      ]
    });

    const defaultFooter = JSON.stringify({
      showWidgets: true,
      showCopyright: true,
      columns: 3,
      backgroundColor: 'bg-gray-100',
      textColor: 'text-gray-600'
    });

    const defaultSidebar = JSON.stringify({
      showWidgets: true,
      backgroundColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      width: 'w-64',
      visible: true
    });

    const defaultNavigationMenu = JSON.stringify([
      { id: "menu-item-1", label: "Inicio", target: "/", openInNewTab: false },
      { id: "menu-item-2", label: "Blog", target: "/blog", openInNewTab: false },
      { id: "menu-item-3", label: "Acerca de", target: "/page/about", openInNewTab: false }
    ]);

    const defaultThemeAssignments = JSON.stringify({
      "header": { "light": 1, "dark": 2 },
      "footer": { "light": 1, "dark": 2 },
      "sidebar": { "light": 1, "dark": 2 }
    });

    const defaultLoadingSpinnerConfig = JSON.stringify({
      enabled: true,
      overlayColor: "rgba(0,0,0,0.3)"
    });

    const defaultThemeSwitcherConfig = JSON.stringify({
      enabled: true,
      position: "bottom-right",
      style: "icon-only"
    });

    const defaultStickyElementsConfig = JSON.stringify({
      header: true,
      footer: false,
      themeSwitcher: true
    });

    // 3. Update GlobalConfig with fixed values - use direct SQL
    console.log("Updating configuration values with direct SQL...");
    
    // Execute a direct SQL update
    await prisma.$executeRaw`
      UPDATE GlobalConfig
      SET 
        header = ${defaultHeader},
        footer = ${defaultFooter},
        sidebar = ${defaultSidebar},
        navigationMenu = ${defaultNavigationMenu},
        themeAssignments = ${defaultThemeAssignments},
        loadingSpinnerConfig = ${defaultLoadingSpinnerConfig},
        themeSwitcherConfig = ${defaultThemeSwitcherConfig},
        stickyElementsConfig = ${defaultStickyElementsConfig},
        siteName = 'Neurowitch',
        siteUrl = 'https://neurowitch.com'
      WHERE id = 'global'
    `;

    console.log("Updated GlobalConfig with default configurations");

    // 4. Verify ThemePresets exist
    const themesCount = await prisma.themePreset.count();
    if (themesCount === 0) {
      console.log("No theme presets found. Creating default themes...");
      
      // Create default light theme
      await prisma.themePreset.create({
        data: {
          id: 1,
          name: "Default Light",
          config: JSON.stringify({
            background: { type: "color", value: "#ffffff" },
            typography: {
              heading: { color: "#1a202c", fontFamily: "system-ui" },
              paragraph: { color: "#4a5568", fontFamily: "system-ui" },
              link: { color: "#3182ce", hoverColor: "#2c5282" }
            }
          })
        }
      });
      
      // Create default dark theme
      await prisma.themePreset.create({
        data: {
          id: 2,
          name: "Default Dark",
          config: JSON.stringify({
            background: { type: "color", value: "#1a202c" },
            typography: {
              heading: { color: "#f7fafc", fontFamily: "system-ui" },
              paragraph: { color: "#e2e8f0", fontFamily: "system-ui" },
              link: { color: "#63b3ed", hoverColor: "#90cdf4" }
            }
          })
        }
      });
      
      console.log("Created default theme presets");
    } else {
      console.log(`Found ${themesCount} existing theme presets`);
    }

    // 5. Update GlobalConfig with theme assignments - use direct SQL
    await prisma.$executeRaw`
      UPDATE GlobalConfig
      SET 
        defaultLightThemePresetId = 1,
        defaultDarkThemePresetId = 2
      WHERE id = 'global'
    `;

    console.log("Updated GlobalConfig with theme assignments");
    console.log("Public interface configuration fixed successfully!");

  } catch (error) {
    console.error("Error fixing config:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
