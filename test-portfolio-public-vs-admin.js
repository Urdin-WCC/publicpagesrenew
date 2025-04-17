// Test script to verify public vs admin views of the portfolio
// This script tests whether the portfolio API correctly filters
// projects by status (public should only see PUBLISHED, admin sees all)

const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

async function main() {
  try {
    console.log('===== TESTING PORTFOLIO PUBLIC VS ADMIN VIEWS =====');

    // Test public view (simulates a non-logged-in user)
    console.log('\n\n===== PUBLIC VIEW TEST =====');
    console.log('Only PUBLISHED projects should appear:');
    
    let response = await fetch('http://localhost:3000/api/portfolio', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const publicData = await response.json();
    console.log(`Total projects returned: ${publicData.projects.length}`);
    
    // Print projects statuses (should all be PUBLISHED)
    const statuses = publicData.projects.map(p => p.status);
    const statusCounts = statuses.reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Status counts in public view:', statusCounts);
    
    // Verify all returned projects are PUBLISHED
    const allPublished = publicData.projects.every(p => p.status === 'PUBLISHED');
    console.log('All projects are PUBLISHED:', allPublished ? '✅ YES' : '❌ NO');
    
    if (!allPublished) {
      console.log('⚠️ ERROR: Non-PUBLISHED projects found in public view:');
      publicData.projects
        .filter(p => p.status !== 'PUBLISHED')
        .forEach(p => console.log(` - [${p.status}] ${p.title} (${p.id})`));
    }
    
    // Test admin view (explicit status filter)
    console.log('\n\n===== ADMIN VIEW TEST =====');
    console.log('Testing explicit status filters:');
    
    // Test PUBLISHED filter
    response = await fetch('http://localhost:3000/api/portfolio?status=PUBLISHED', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        // Session cookie would be included automatically in a browser
      }
    });
    
    const publishedData = await response.json();
    console.log(`PUBLISHED filter - projects returned: ${publishedData.projects.length}`);
    const allPublishedInFilter = publishedData.projects.every(p => p.status === 'PUBLISHED');
    console.log('All have PUBLISHED status:', allPublishedInFilter ? '✅ YES' : '❌ NO');
    
    // Test DRAFT filter
    response = await fetch('http://localhost:3000/api/portfolio?status=DRAFT', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const draftData = await response.json();
    console.log(`DRAFT filter - projects returned: ${draftData.projects.length}`);
    const allDraftInFilter = draftData.projects.every(p => p.status === 'DRAFT');
    console.log('All have DRAFT status:', allDraftInFilter ? '✅ YES' : '❌ NO');
    
    // Test ARCHIVED filter
    response = await fetch('http://localhost:3000/api/portfolio?status=ARCHIVED', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const archivedData = await response.json();
    console.log(`ARCHIVED filter - projects returned: ${archivedData.projects.length}`);
    const allArchivedInFilter = archivedData.projects.every(p => p.status === 'ARCHIVED');
    console.log('All have ARCHIVED status:', allArchivedInFilter ? '✅ YES' : '❌ NO');
    
    console.log('\n===== SUMMARY =====');
    console.log('Public API correctly filters projects:', allPublished ? '✅ YES' : '❌ NO');
    console.log('Status filters working correctly:', 
      (allPublishedInFilter && allDraftInFilter && allArchivedInFilter) ? '✅ YES' : '❌ NO');
      
    if (allPublished && allPublishedInFilter && allDraftInFilter && allArchivedInFilter) {
      console.log('\n✅ ALL TESTS PASSED: Portfolio API is correctly filtering projects by status');
    } else {
      console.log('\n❌ TESTS FAILED: Issues with portfolio status filtering detected');
    }
    
  } catch (error) {
    console.error('Error testing portfolio views:', error);
  }
}

main()
  .catch(e => {
    console.error('Unhandled error:', e);
    process.exit(1);
  });
