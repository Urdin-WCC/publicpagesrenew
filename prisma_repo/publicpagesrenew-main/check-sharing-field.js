const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Checking GlobalConfig sharing field...")
    
    // Get GlobalConfig
    const globalConfig = await prisma.$queryRaw`
      SELECT id, siteName, sharing
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (globalConfig.length === 0) {
      console.log("No GlobalConfig found");
      return;
    }
    
    console.log("GlobalConfig ID:", globalConfig[0].id);
    console.log("siteName:", globalConfig[0].siteName);
    console.log("sharing field:", globalConfig[0].sharing || "(null)");
    
    // Test if sharing field can be parsed
    if (globalConfig[0].sharing) {
      try {
        // If it's a string, try to parse it
        if (typeof globalConfig[0].sharing === 'string') {
          const parsed = JSON.parse(globalConfig[0].sharing);
          console.log("Sharing field parsed successfully:", parsed);
        } else {
          console.log("Sharing field is not a string:", typeof globalConfig[0].sharing);
        }
      } catch (parseError) {
        console.error("Error parsing sharing field:", parseError);
      }
    }
    
    // Add a test button
    console.log("\nAdding a test sharing button...")
    
    // Create a test button structure
    const testSharing = {
      buttons: [
        {
          name: "Test Button",
          shareUrlBase: "https://example.com/share?url=",
          icon: "twitter",
          newTab: true
        }
      ]
    };
    
    // Try to save it
    const jsonString = JSON.stringify(testSharing);
    console.log("JSON to save:", jsonString);
    
    // Save using direct SQL
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET sharing = '${jsonString}'
      WHERE id = 'global'
    `);
    
    console.log("Update completed, checking result...")
    
    // Get updated config
    const updatedConfig = await prisma.$queryRaw`
      SELECT sharing
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    console.log("Updated sharing field:", updatedConfig[0].sharing || "(null)");
    
    console.log("\nTest completed!");
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
