import { prisma } from '@/lib/prisma';
import { getGlobalConfig } from '@/lib/config-server';
import { GlobalConfig } from '@/lib/seoUtils';
import { MetadataRoute } from 'next';

/**
 * Generates the sitemap.xml for the application by fetching all public content.
 * @returns Array of sitemap entries
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get the global config to access the site URL
  const config = await getGlobalConfig() as any as GlobalConfig;
  
  // Get the base URL from the global config or default to localhost
  const baseUrl = config?.siteUrl || 'http://localhost:3000';
  
  // Initialize the array of sitemap entries
  const sitemapEntries: MetadataRoute.Sitemap = [];
  
  // Add the homepage
  sitemapEntries.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  });
  
  // Fetch all published blog posts
  try {
    const posts = await prisma.$queryRaw`
      SELECT slug, updatedAt FROM Post 
      WHERE status = 'PUBLISHED' AND deleted = false
    `;
    
    // Add each blog post to the sitemap
    if (Array.isArray(posts)) {
      const blogEntries = posts.map((post: { slug: string; updatedAt: any }) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt), // Convert to Date object
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
      
      sitemapEntries.push(...blogEntries);
    }
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
  }
  
  // Fetch all published portfolio projects
  try {
    const projects = await prisma.$queryRaw`
      SELECT slug, updatedAt FROM Project 
      WHERE status = 'PUBLISHED' AND deleted = false
    `;
    
    // Add each portfolio project to the sitemap
    if (Array.isArray(projects)) {
      const portfolioEntries = projects.map((project: { slug: string; updatedAt: any }) => ({
        url: `${baseUrl}/portfolio/${project.slug}`,
        lastModified: new Date(project.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
      
      sitemapEntries.push(...portfolioEntries);
    }
  } catch (error) {
    console.error("Error fetching portfolio projects for sitemap:", error);
  }
  
  // Fetch all visible static pages
  try {
    const staticPages = await prisma.$queryRaw`
      SELECT slug, updatedAt FROM StaticPage 
      WHERE isVisible = true
    `;
    
    // Add each static page to the sitemap
    if (Array.isArray(staticPages)) {
      const staticPageEntries = staticPages.map((page: { slug: string; updatedAt: any }) => ({
        url: `${baseUrl}/${page.slug}`,
        lastModified: new Date(page.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
      
      sitemapEntries.push(...staticPageEntries);
    }
  } catch (error) {
    console.error("Error fetching static pages for sitemap:", error);
  }
  
  // Add blog and portfolio category pages
  try {
    const categories = await prisma.$queryRaw`
      SELECT slug, updatedAt FROM Category
    `;
    
    if (Array.isArray(categories)) {
      // Add blog category pages
      const blogCategoryEntries = categories.map((category: { slug: string; updatedAt: any }) => ({
        url: `${baseUrl}/blog/category/${category.slug}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }));
      
      sitemapEntries.push(...blogCategoryEntries);
      
      // Add portfolio category pages
      const portfolioCategoryEntries = categories.map((category: { slug: string; updatedAt: any }) => ({
        url: `${baseUrl}/portfolio/category/${category.slug}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }));
      
      sitemapEntries.push(...portfolioCategoryEntries);
    }
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
  }
  
  return sitemapEntries;
}
