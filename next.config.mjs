/**
 * Next.js configuration
 *
 * This configuration includes security headers to protect the application
 * from common web vulnerabilities.
 */
const nextConfig = {
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

  /**
   * Webpack configuration
   * 
   * This configuration handles Node.js built-in modules that are used by dependencies
   * like Prisma and Auth.js
   */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Polyfills para módulos de Node.js en el cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        path: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        async_hooks: false,
      };
    }
    
    // Manejar módulos con prefijo 'node:'
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:async_hooks': 'async_hooks-browserify',
      'node:buffer': 'buffer',
      'node:crypto': 'crypto-browserify',
      'node:events': 'events',
      'node:fs': 'browserify-fs',
      'node:http': 'stream-http',
      'node:https': 'https-browserify',
      'node:net': 'net-browserify',
      'node:os': 'os-browserify',
      'node:path': 'path-browserify',
      'node:stream': 'stream-browserify',
      'node:url': 'url',
      'node:util': 'util',
      'node:zlib': 'browserify-zlib',
    };
    
    return config;
  },
  
  // Transpile módulos específicos
  transpilePackages: ['@prisma/client', '@auth/prisma-adapter'],
};

export default nextConfig;
