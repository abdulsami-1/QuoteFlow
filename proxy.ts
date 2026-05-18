import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// In-memory rate limiter for middleware — same caveats as lib/rate-limiter.ts
// Replace with Upstash Redis for multi-instance production deployments.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkGlobalRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is required')
  return new TextEncoder().encode(secret)
}

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('qf_session')?.value
  if (!token) return false
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ip = getIP(req)

  // Global rate limit: 60 req/min per IP for all matched routes
  // Stripe webhook is exempt — it comes from Stripe servers, not end users
  if (!pathname.startsWith('/api/stripe/webhook')) {
    const allowed = checkGlobalRateLimit(ip, 60, 60 * 1000)
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      )
    }
  }

  // Public routes — allow through
  const publicPaths = [
    '/login',
    '/signup',
    '/api/auth/',
    '/api/health',
    '/api/intake/',
    '/intake/',
  ]
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))
  if (isPublic) return NextResponse.next()

  // Protected dashboard pages
  if (pathname.startsWith('/dashboard')) {
    const authed = await isAuthenticated(req)
    if (!authed) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }

  // Protected API routes
  const protectedApiPaths = [
    '/api/business',
    '/api/services',
    '/api/pricing',
    '/api/leads',
    '/api/stats',
    '/api/notifications',
  ]
  const isProtectedApi = protectedApiPaths.some((p) => pathname.startsWith(p))
  if (isProtectedApi) {
    const authed = await isAuthenticated(req)
    if (!authed) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/business/:path*',
    '/api/services/:path*',
    '/api/pricing/:path*',
    '/api/leads/:path*',
    '/api/stats/:path*',
    '/api/notifications/:path*',
    '/login',
    '/signup',
    '/api/auth/:path*',
    '/api/health',
    '/api/intake/:path*',
    '/api/stripe/:path*',
    '/intake/:path*',
  ],
}
