const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // Check the ThemePreset model structure
    const lightTheme = await prisma.themePreset.create({
      data: {
        name: 'Test Light Theme',
        // Using the direct assignment for the JSON field
        config: JSON.stringify({
          '--background': '#ffffff',
        }),
      },
    })
    
    console.log('Created ThemePreset:', lightTheme)
    
    // Update GlobalConfig
    const config = await prisma.globalConfig.update({
      where: { id: 'global' },
      data: {
        defaultLightThemePresetId: lightTheme.id,
        defaultDarkThemePresetId: null,
        // Using direct assignment for JSON fields
        themeAssignments: JSON.stringify({}),
        loadingSpinnerConfig: JSON.stringify({ enabled: false }),
        themeSwitcherConfig: JSON.stringify({ enabled: true }),
        stickyElementsConfig: JSON.stringify({ header: false }),
      },
    })
    
    console.log('Updated GlobalConfig:', config)
    
    // Clean up test data
    await prisma.themePreset.delete({
      where: { id: lightTheme.id }
    })
    
    console.log('Test completed successfully')
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
