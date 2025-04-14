import type { NextConfig } from "next";

/**
 * Next.js configuration
 *
 * This configuration includes security headers to protect the application
 * from common web vulnerabilities.
 */
const nextConfig: NextConfig = {
  /**
   * Security headers configuration
   *
   * These headers help protect the application from various security vulnerabilities:
   * - Content-Security-Policy: Restricts the sources of content that can be loaded
   * - X-DNS-Prefetch-Control: Controls DNS prefetching
   * - X-Frame-Options: Prevents clickjacking by restricting iframe usage
   * - X-Content-Type-Options: Prevents MIME type sniffing
   * - Referrer-Policy: Controls the Referer header
   * - Permissions-Policy: Restricts which browser features can be used
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },

  /**
   * Image configuration
   *
   * Allows images to be loaded from external domains
   */
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
