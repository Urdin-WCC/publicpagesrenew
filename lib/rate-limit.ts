/**
 * Simple in-memory rate limiter for API routes
 * Limits requests based on IP address
 *
 * @public
 */

/**
 * Rate limit entry interface
 * @interface
 */
interface RateLimitEntry {
  /** Number of attempts made within the current window */
  count: number;
  /** Timestamp when the current rate limit window resets */
  resetTime: number;
}

// Store rate limit data in memory
// In a production environment, consider using Redis or another distributed store
const rateLimitStore = new Map<string, RateLimitEntry>();

// Get rate limit configuration from environment variables
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Get the maximum number of attempts allowed from environment variables
 * @returns The maximum number of attempts allowed
 */
export function getMaxAttempts(): number {
  const envValue = process.env.RATE_LIMIT_MAX_ATTEMPTS;
  if (!envValue) return DEFAULT_MAX_ATTEMPTS;

  const parsed = parseInt(envValue, 10);
  return isNaN(parsed) ? DEFAULT_MAX_ATTEMPTS : parsed;
}

/**
 * Get the rate limit window duration from environment variables
 * @returns The rate limit window duration in milliseconds
 */
export function getWindowMs(): number {
  const envValue = process.env.RATE_LIMIT_WINDOW_MS;
  if (!envValue) return DEFAULT_WINDOW_MS;

  const parsed = parseInt(envValue, 10);
  return isNaN(parsed) ? DEFAULT_WINDOW_MS : parsed;
}

/**
 * Check if a request should be rate limited
 *
 * @param ip - The IP address to check
 * @param limit - The maximum number of requests allowed in the window (defaults to env value or 5)
 * @param windowMs - The time window in milliseconds (defaults to env value or 60000)
 * @returns Object containing whether the request is limited and remaining attempts
 *
 * @example
 * ```ts
 * const { limited, remaining } = rateLimit(clientIp);
 * if (limited) {
 *   // Return 429 Too Many Requests
 * }
 * ```
 *
 * @public
 */
export function rateLimit(
  ip: string,
  limit: number = getMaxAttempts(),
  windowMs: number = getWindowMs()
): { limited: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // If no entry exists or the entry has expired, create a new one
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { limited: false, remaining: limit - 1 };
  }

  // If the entry exists and is within the time window
  if (entry.count >= limit) {
    return { limited: true, remaining: 0 };
  }

  // Increment the count
  entry.count += 1;
  rateLimitStore.set(ip, entry);

  return { limited: false, remaining: limit - entry.count };
}

/**
 * Middleware to apply rate limiting to API routes
 *
 * @param req - The Next.js request object
 * @param limit - The maximum number of requests allowed in the window (defaults to env value or 5)
 * @param windowMs - The time window in milliseconds (defaults to env value or 60000)
 * @returns Object containing whether the request is limited and remaining attempts
 *
 * @example
 * ```ts
 * // In an API route
 * const { limited, remaining } = applyRateLimit(req);
 * if (limited) {
 *   return new Response(JSON.stringify({ error: 'Too many requests' }), {
 *     status: 429,
 *     headers: { 'Content-Type': 'application/json' }
 *   });
 * }
 * ```
 *
 * @public
 */
export function applyRateLimit(
  req: Request,
  limit: number = getMaxAttempts(),
  windowMs: number = getWindowMs()
): { limited: boolean; remaining: number } {
  // Get the IP from the request
  // In production, you might need to handle proxy headers like X-Forwarded-For
  const ip = req.headers.get("x-forwarded-for") ||
             req.headers.get("x-real-ip") ||
             "unknown";

  return rateLimit(ip.toString(), limit, windowMs);
}
