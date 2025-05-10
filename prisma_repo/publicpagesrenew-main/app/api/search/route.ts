import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Extract query parameters
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const typeParam = url.searchParams.get('type') || 'all';
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const skip = (page - 1) * limit;

  // Return empty results if no search query
  if (!query.trim()) {
    return NextResponse.json({ 
      results: [], 
      total: 0,
      page,
      limit
    });
  }

  try {
    const results: any[] = [];
    let total = 0;

    // Determine which content types to search based on the type parameter
    const searchTypes = typeParam === 'all' 
      ? ['posts', 'projects', 'pages'] 
      : [typeParam];

    // Search posts if included
    if (searchTypes.includes('posts')) {
      // Use SQL directly to avoid Prisma TypeScript issues
      const postsResults = await prisma.$queryRaw`
        SELECT 
          id, 
          title, 
          slug, 
          excerpt, 
          coverImage, 
          publishedAt
        FROM Post 
        WHERE 
          (
            title LIKE ${'%' + query + '%'} OR 
            content LIKE ${'%' + query + '%'} OR 
            excerpt LIKE ${'%' + query + '%'}
          )
          AND status = 'PUBLISHED' 
          AND deleted = false
        ORDER BY publishedAt DESC
        LIMIT ${limit}
        OFFSET ${skip}
      `;
      
      const postsCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM Post 
        WHERE 
          (
            title LIKE ${'%' + query + '%'} OR 
            content LIKE ${'%' + query + '%'} OR 
            excerpt LIKE ${'%' + query + '%'}
          )
          AND status = 'PUBLISHED' 
          AND deleted = false
      `;
      
      // Format post results for the response
      const formattedPosts = Array.isArray(postsResults) ? postsResults.map((post: any) => ({
        ...post,
        type: 'post',
        url: `/blog/${post.slug}`
      })) : [];
      
      results.push(...formattedPosts);
      total += Array.isArray(postsCount) && postsCount.length > 0 ? Number(postsCount[0].count) || 0 : 0;
    }

    // Search projects if included
    if (searchTypes.includes('projects')) {
      // Use SQL directly to avoid Prisma TypeScript issues
      const projectsResults = await prisma.$queryRaw`
        SELECT 
          id, 
          title, 
          slug, 
          excerpt, 
          coverImage, 
          publishedAt
        FROM Project 
        WHERE 
          (
            title LIKE ${'%' + query + '%'} OR 
            content LIKE ${'%' + query + '%'} OR 
            excerpt LIKE ${'%' + query + '%'}
          )
          AND status = 'PUBLISHED' 
          AND deleted = false
        ORDER BY publishedAt DESC
        LIMIT ${limit}
        OFFSET ${skip}
      `;
      
      const projectsCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM Project 
        WHERE 
          (
            title LIKE ${'%' + query + '%'} OR 
            content LIKE ${'%' + query + '%'} OR 
            excerpt LIKE ${'%' + query + '%'}
          )
          AND status = 'PUBLISHED' 
          AND deleted = false
      `;
      
      // Format project results for the response
      const formattedProjects = Array.isArray(projectsResults) ? projectsResults.map((project: any) => ({
        ...project,
        type: 'project',
        url: `/portfolio/${project.slug}`
      })) : [];
      
      results.push(...formattedProjects);
      total += Array.isArray(projectsCount) && projectsCount.length > 0 ? Number(projectsCount[0].count) || 0 : 0;
    }

    // Search static pages if included
    if (searchTypes.includes('pages')) {
      // Use SQL directly to avoid Prisma TypeScript issues
      const pagesResults = await prisma.$queryRaw`
        SELECT 
          id, 
          title, 
          slug, 
          metaDescription
        FROM StaticPage 
        WHERE 
          title LIKE ${'%' + query + '%'} OR 
          contentHtml LIKE ${'%' + query + '%'}
        LIMIT ${limit}
        OFFSET ${skip}
      `;
      
      const pagesCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM StaticPage 
        WHERE 
          title LIKE ${'%' + query + '%'} OR 
          contentHtml LIKE ${'%' + query + '%'}
      `;
      
      // Format page results for the response
      const formattedPages = Array.isArray(pagesResults) ? pagesResults.map((page: any) => ({
        ...page,
        type: 'page',
        url: `/page/${page.slug}`,
        excerpt: page.metaDescription
      })) : [];
      
      results.push(...formattedPages);
      total += Array.isArray(pagesCount) && pagesCount.length > 0 ? Number(pagesCount[0].count) || 0 : 0;
    }

    // Sort results by relevance or date
    results.sort((a, b) => {
      // If both have publishedAt dates, sort by date (newest first)
      if (a.publishedAt && b.publishedAt) {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      
      // Move items with the query in the title to the top
      const aHasQueryInTitle = a.title.toLowerCase().includes(query.toLowerCase());
      const bHasQueryInTitle = b.title.toLowerCase().includes(query.toLowerCase());
      
      if (aHasQueryInTitle && !bHasQueryInTitle) return -1;
      if (!aHasQueryInTitle && bHasQueryInTitle) return 1;
      
      // Default sort by title
      return a.title.localeCompare(b.title);
    });

    // Return results with metadata
    return NextResponse.json({
      results: results.slice(0, limit),
      total,
      page,
      limit,
      hasMore: skip + limit < total
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
