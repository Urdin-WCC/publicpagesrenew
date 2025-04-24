import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, authOptions } from '@/lib/auth';

/**
 * Get related posts
 * @param request 
 * @returns 
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const postId = url.searchParams.get('postId');
    const categoryIdsParam = url.searchParams.get('categoryIds');
    const limit = parseInt(url.searchParams.get('limit') || '3', 10);
    
    if (!postId) {
      return NextResponse.json({ error: 'Missing postId parameter' }, { status: 400 });
    }
    
    // Parse category IDs (if provided)
    let categoryIds: number[] = [];
    try {
      if (categoryIdsParam) {
        categoryIds = JSON.parse(categoryIdsParam);
        // Ensure it's an array of numbers
        if (!Array.isArray(categoryIds)) {
          categoryIds = [];
        }
      }
    } catch (e) {
      console.error('Error parsing categoryIds:', e);
    }
    
    // Build the query to find related posts
    // First get posts with matching categories, then fall back to most recent posts if needed
    let relatedPosts: any[] = [];
    
    if (categoryIds.length > 0) {
      // SQL to find posts with matching categories, excluding the current post
      // This complex query finds posts that share at least one category with the current post
      const categoryMatches = await prisma.$queryRaw`
        SELECT 
          p.id, 
          p.title, 
          p.slug, 
          p.excerpt,
          p.coverImage,
          p.publishedAt
        FROM Post p
        WHERE 
          p.id != ${postId} AND
          p.status = 'PUBLISHED' AND
          p.deleted = false AND
          (
            /* Check if categoryIds array contains any of the categories */
            JSON_CONTAINS(p.categoryIds, JSON_ARRAY(${categoryIds[0]}))
            ${categoryIds.slice(1).map(id => ` OR JSON_CONTAINS(p.categoryIds, JSON_ARRAY(${id}))`).join('')}
          )
        ORDER BY p.publishedAt DESC
        LIMIT ${Math.min(limit * 2, 10)}
      `;
      
      relatedPosts = Array.isArray(categoryMatches) ? categoryMatches : [];
    }
    
    // If we don't have enough related posts by category, get recent posts
    if (relatedPosts.length < limit) {
      const neededPosts = limit - relatedPosts.length;
      // Get IDs of posts we already have, to exclude them
      const existingIds = [postId, ...relatedPosts.map(p => p.id)];
      
      const recentPosts = await prisma.$queryRaw`
        SELECT 
          p.id, 
          p.title, 
          p.slug, 
          p.excerpt,
          p.coverImage,
          p.publishedAt
        FROM Post p
        WHERE 
          p.id NOT IN (${existingIds.join(',')}) AND
          p.status = 'PUBLISHED' AND
          p.deleted = false
        ORDER BY p.publishedAt DESC
        LIMIT ${neededPosts}
      `;
      
      if (Array.isArray(recentPosts)) {
        relatedPosts = [...relatedPosts, ...recentPosts];
      }
    }
    
    // Format dates for JSON response
    relatedPosts = relatedPosts.map(post => ({
      ...post,
      publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
    }));
    
    // Return only the requested number of posts
    relatedPosts = relatedPosts.slice(0, limit);
    
    return NextResponse.json({
      posts: relatedPosts,
    });
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
