// WARNING: In-memory rate limiting. Each server instance has its own bucket.
// On multi-instance deployments (Railway, Vercel, etc.) the effective limit is
// N × LIMIT per hour per IP.
// Future: replace with Upstash Redis for production multi-instance support.
// https://upstash.com/docs/redis/sdks/ratelimit-ts/overview

const ipMap = new Map<string, { count: number; resetAt: number }>()
const LIMIT = 10
const WINDOW_MS = 60 * 60 * 1000

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export function rateLimitResponse(
  result: RateLimitResult,
  message = 'Too many requests. Please try again later.'
): Response {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000)
  return Response.json(
    { success: false, error: message },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(LIMIT),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    }
  )
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now()
  const entry = ipMap.get(ip)
  if (!entry || now > entry.resetAt) {
    const resetAt = now + WINDOW_MS
    ipMap.set(ip, { count: 1, resetAt })
    return { allowed: true, remaining: LIMIT - 1, resetAt }
  }
  if (entry.count >= LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }
  entry.count++
  return { allowed: true, remaining: LIMIT - entry.count, resetAt: entry.resetAt }
}

const buckets = new Map<string, Map<string, { count: number; resetAt: number }>>()

export function checkRateLimitWith(
  ip: string,
  limit: number,
  windowMs: number,
  bucket: string,
): RateLimitResult {
  if (!buckets.has(bucket)) buckets.set(bucket, new Map())
  const map = buckets.get(bucket)!
  const now = Date.now()
  const entry = map.get(ip)
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs
    map.set(ip, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }
  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

export function rateLimitResponseWith(
  result: RateLimitResult,
  limit: number,
  message = 'Too many requests. Please try again later.',
  corsHeaders?: Record<string, string>
): Response {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000)
  return Response.json(
    { success: false, error: message },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
        ...corsHeaders,
      },
    }
  )
}

export function _resetForTest(ip: string): void {
  ipMap.delete(ip)
}

export function _getEntryForTest(ip: string) {
  return ipMap.get(ip)
}
