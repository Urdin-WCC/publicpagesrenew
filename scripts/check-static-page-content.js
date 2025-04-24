const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStaticPageContent() {
  try {
    console.log('Checking static page content for the homepage...');
    
    // Get the content of the homepage
    const homepage = await prisma.$queryRaw`
      SELECT 
        id,
        title, 
        slug, 
        contentHtml, 
        metaTitle, 
        metaDescription,
        createdAt,
        updatedAt
      FROM StaticPage
      WHERE slug = 'inicio'
      LIMIT 1
    `;
    
    if (Array.isArray(homepage) && homepage.length > 0) {
      const page = homepage[0];
      console.log('\nHomepage found:');
      console.log('Title:', page.title);
      console.log('ID:', page.id);
      console.log('Created:', page.createdAt);
      console.log('Updated:', page.updatedAt);
      
      // Check if contentHtml is a string
      if (typeof page.contentHtml === 'string') {
        console.log('\nContent is a string of length:', page.contentHtml.length);
        
        // Show the first 200 characters
        console.log('\nFirst 200 characters of content:');
        console.log(page.contentHtml.substring(0, 200));
        
        // Check for common HTML tags
        console.log('\nHTML tag analysis:');
        const htmlTags = (page.contentHtml.match(/<[^>]+>/g) || []).slice(0, 10);
        console.log('First 10 HTML tags found:', htmlTags);
        
        // Check if content might be double-encoded
        const doubleEncodedCheck = page.contentHtml.includes('&lt;') && page.contentHtml.includes('&gt;');
        console.log('Possibly double-encoded:', doubleEncodedCheck);
        
        // Check if content has actual HTML structure
        const hasHtmlStructure = page.contentHtml.includes('</p>') || 
                                page.contentHtml.includes('</div>') || 
                                page.contentHtml.includes('</h1>');
        console.log('Has HTML structure:', hasHtmlStructure);
        
      } else {
        console.log('\nContent is NOT a string but a:', typeof page.contentHtml);
        console.log('Raw value:', page.contentHtml);
      }
    } else {
      console.log('No homepage found with slug "inicio"');
    }
  } catch (error) {
    console.error('Error checking page content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
checkStaticPageContent();
