const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Testing sharing settings save/load functionality...")
    
    // 1. Save a test sharing configuration
    const testSharing = {
      buttons: [
        {
          name: "Test Facebook",
          shareUrlBase: "https://www.facebook.com/sharer/sharer.php?u=",
          icon: "facebook",
          newTab: true
        },
        {
          name: "Test Twitter",
          shareUrlBase: "https://twitter.com/intent/tweet?url=",
          icon: "twitter",
          newTab: true
        }
      ]
    };
    
    console.log("\nSaving test sharing configuration...");
    await prisma.$executeRawUnsafe(`
      UPDATE GlobalConfig
      SET sharing = '${JSON.stringify(testSharing)}'
      WHERE id = 'global'
    `);
    
    // 2. Retrieve it using a query that mimics getGlobalConfig
    console.log("\nRetrieving with full query (like getGlobalConfig)...");
    const fullResult = await prisma.$queryRaw`
      SELECT 
        id, siteName, siteUrl, logoUrl, faviconUrl, themeColor, sharing
      FROM GlobalConfig 
      WHERE id = 'global'
    `;
    
    if (fullResult.length > 0) {
      const sharingField = fullResult[0].sharing;
      console.log("Retrieved sharing field:", sharingField);
      
      try {
        // Verify we can parse it
        if (typeof sharingField === 'string') {
          const parsedSharing = JSON.parse(sharingField);
          console.log("\nSuccessfully parsed sharing settings:");
          console.log(" - Found", parsedSharing.buttons?.length || 0, "sharing buttons");
          parsedSharing.buttons?.forEach(button => {
            console.log(` - ${button.name} (${button.shareUrlBase})`);
          });
        } else {
          console.log("\nSharing field is not a string:", typeof sharingField);
        }
      } catch (parseError) {
        console.error("\nError parsing sharing field:", parseError);
      }
    } else {
      console.log("No GlobalConfig found");
    }
    
    console.log("\nTest completed successfully!");
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
