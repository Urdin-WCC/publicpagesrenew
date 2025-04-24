import { getGlobalConfig } from '@/lib/config-server';
import { processRobotsTxt, GlobalConfig } from '@/lib/seoUtils';
import { MetadataRoute } from 'next';

/**
 * Generates the robots.txt file for the application.
 * @returns Robots metadata route object
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  // Get the global config to access robotsTxtContent and baseUrl
  const config = await getGlobalConfig() as any as GlobalConfig;

  if (!config) {
    // Fallback if configuration is not available
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      sitemap: `http://localhost:3000/sitemap.xml`,
    };
  }

  // Get the site URL from config or default to localhost
  const baseUrl = config.siteUrl || 'http://localhost:3000';

  // The robotsTxtContent field in GlobalConfig is a string that contains
  // the raw content of robots.txt. We need to parse this to get rules.
  // However, since Next.js Metadata API requires a structured object,
  // we'll extract from the custom content and provide defaults

  // Process any custom robots.txt content from GlobalConfig
  const customRobotsTxt = processRobotsTxt(
    config.robotsTxtContent, 
    `${baseUrl}/sitemap.xml`
  );
  
  // Parse through the custom content to extract rules
  // This is a basic implementation - for complex rules,
  // you might need more sophisticated parsing
  const rules: Array<{
    userAgent: string;
    allow: string | string[];
    disallow: string | string[];
  }> = [];
  
  // Default rules if none are present in the custom content
  const defaultRules = {
    userAgent: '*',
    allow: '/',
    disallow: ['/admin/', '/api/'],
  };
  
  // Add custom rules if possible, or use default
  if (customRobotsTxt) {
    const lines = customRobotsTxt.split('\n');

    let currentUserAgent: string | null = null;
    let currentRules: { allow: string[], disallow: string[] } = { allow: [], disallow: [] };

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      // Skip sitemap directive as we handle it separately
      if (trimmedLine.toLowerCase().startsWith('sitemap:')) {
        continue;
      }

      // Parse User-agent
      if (trimmedLine.toLowerCase().startsWith('user-agent:')) {
        // If we were building a rule, save it
        if (currentUserAgent !== null) {
          rules.push({
            userAgent: currentUserAgent,
            allow: currentRules.allow.length > 0 ? currentRules.allow : '/',
            disallow: currentRules.disallow.length > 0 ? currentRules.disallow : [],
          });
        }

        // Start a new rule
        currentUserAgent = trimmedLine.substring('user-agent:'.length).trim();
        currentRules = { allow: [], disallow: [] };
      }
      // Parse Allow
      else if (trimmedLine.toLowerCase().startsWith('allow:')) {
        const path = trimmedLine.substring('allow:'.length).trim();
        if (path) {
          currentRules.allow.push(path);
        }
      }
      // Parse Disallow
      else if (trimmedLine.toLowerCase().startsWith('disallow:')) {
        const path = trimmedLine.substring('disallow:'.length).trim();
        if (path) {
          currentRules.disallow.push(path);
        }
      }
    }

    // Save the last rule if there is one
    if (currentUserAgent !== null) {
      rules.push({
        userAgent: currentUserAgent,
        allow: currentRules.allow.length > 0 ? currentRules.allow : '/',
        disallow: currentRules.disallow.length > 0 ? currentRules.disallow : [],
      });
    }
  }

  // If no valid rules were extracted, use default rules
  if (rules.length === 0) {
    rules.push(defaultRules);
  }

  // Return the robots metadata route object
  return {
    rules,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
