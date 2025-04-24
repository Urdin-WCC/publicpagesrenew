import { GlobalConfig as PrismaGlobalConfig } from "@prisma/client";
import { Metadata } from "next";

/**
 * Extended GlobalConfig interface with SEO fields
 */
export interface GlobalConfig extends PrismaGlobalConfig {
  globalMetaTitle?: string | null;
  globalMetaDescription?: string | null;
  globalKeywords?: string | null;
  defaultSocialShareImage?: string | null;
  robotsTxtContent?: string | null;
  googleAnalyticsId?: string | null;
  googleTagManagerId?: string | null;
}

/**
 * Interface for JSON-LD structured data
 */
export interface JsonLdData {
  "@context": string;
  "@type": string;
  [key: string]: any;
}

/**
 * Generates website structured data for JSON-LD
 * @param config - Global configuration
 * @returns Website structured data object
 */
export function generateWebsiteJsonLd(config: GlobalConfig): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.siteName,
    url: config.siteUrl,
    description: config.globalMetaDescription || "",
  };
}

/**
 * Generates article structured data for JSON-LD
 * @param config - Global configuration
 * @param data - Article specific data
 * @returns Article structured data object
 */
export function generateArticleJsonLd(
  config: GlobalConfig,
  data: {
    title: string;
    description?: string;
    image?: string;
    url: string;
    datePublished: string;
    dateModified: string;
    authorName?: string;
  }
): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.description || config.globalMetaDescription || "",
    image: data.image || config.defaultSocialShareImage || "",
    url: `${config.siteUrl}${data.url}`,
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    author: {
      "@type": "Person",
      name: data.authorName || config.siteName,
    },
    publisher: {
      "@type": "Organization",
      name: config.siteName,
      logo: {
        "@type": "ImageObject",
        url: config.logoUrl || "",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${config.siteUrl}${data.url}`,
    },
  };
}

/**
 * Generates BreadcrumbList structured data for JSON-LD
 * @param config - Global configuration
 * @param items - Breadcrumb items
 * @returns BreadcrumbList structured data object
 */
export function generateBreadcrumbsJsonLd(
  config: GlobalConfig,
  items: Array<{ name: string; url: string }>
): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${config.siteUrl}${item.url}`,
    })),
  };
}

/**
 * Generates base metadata for the public layout
 * @param config - Global configuration
 * @returns Metadata object for Next.js
 */
export function generateBaseMetadata(config: GlobalConfig): Metadata {
  // Create metadata object
  const metadata: Metadata = {
    title: {
      default: config.globalMetaTitle || config.siteName,
      template: `%s | ${config.siteName}`,
    },
    description: config.globalMetaDescription,
    keywords: config.globalKeywords?.split(',').map(k => k.trim()),
    robots: {
      index: true,
      follow: true,
    },
  };
  
  // Only add metadataBase if we have a valid URL
  if (config.siteUrl && typeof config.siteUrl === 'string' && config.siteUrl.trim() !== '') {
    try {
      metadata.metadataBase = new URL(config.siteUrl);
    } catch (e) {
      console.error('Invalid siteUrl in config:', config.siteUrl);
      // Fallback to a default URL
      metadata.metadataBase = new URL('http://localhost:3000');
    }
  }
  
  return {
    ...metadata,
    openGraph: {
      siteName: config.siteName,
      images: config.defaultSocialShareImage ? [config.defaultSocialShareImage] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      images: config.defaultSocialShareImage ? [config.defaultSocialShareImage] : undefined,
    },
    icons: config.faviconUrl ? [
      {
        url: config.faviconUrl,
        rel: 'icon',
      }
    ] : undefined,
  };
}

/**
 * Generates page-specific metadata
 * @param config - Global configuration
 * @param pageData - Page specific data
 * @returns Metadata object for Next.js
 */
export function generatePageMetadata(
  config: GlobalConfig, 
  pageData: {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
    url: string;
    type?: 'website' | 'article' | 'profile';
  }
): Metadata {
  const keywords = pageData.keywords ? 
    pageData.keywords.split(',').map(k => k.trim()) : 
    config.globalKeywords?.split(',').map(k => k.trim());

  const fullUrl = `${config.siteUrl}${pageData.url}`;
  
  return {
    title: pageData.title,
    description: pageData.description || config.globalMetaDescription,
    keywords: keywords,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: pageData.title,
      description: pageData.description || config.globalMetaDescription || undefined,
      url: fullUrl,
      siteName: config.siteName,
      images: pageData.image ? [pageData.image] : 
              config.defaultSocialShareImage ? [config.defaultSocialShareImage] : 
              undefined,
      type: pageData.type || 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.title,
      description: pageData.description || config.globalMetaDescription || undefined,
      images: pageData.image ? [pageData.image] : 
              config.defaultSocialShareImage ? [config.defaultSocialShareImage] : 
              undefined,
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

/**
 * Sanitizes robots.txt content
 * @param content - Raw robots.txt content
 * @param sitemapUrl - Full sitemap URL
 * @returns Processed robots.txt content
 */
export function processRobotsTxt(content: string | null | undefined, sitemapUrl: string): string {
  const baseContent = content?.trim() || '';
  
  // Check if Sitemap directive exists
  const hasSitemap = /^Sitemap:/im.test(baseContent);
  
  // Add default rules and sitemap if not present
  let result = baseContent;
  
  // Add default User-agent if missing
  if (!/^User-agent:/im.test(result)) {
    result = `User-agent: *\nAllow: /\n${result}`;
  }
  
  // Add Sitemap if missing
  if (!hasSitemap) {
    result += `\n\nSitemap: ${sitemapUrl}`;
  }
  
  return result;
}
