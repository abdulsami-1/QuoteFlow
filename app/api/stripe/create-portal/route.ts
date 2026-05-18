import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { checkRateLimitWith, getClientIP, rateLimitResponseWith } from '@/lib/rate-limiter'

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req)
    const rl = checkRateLimitWith(ip, 10, 60 * 1000, 'stripe-portal')
    if (!rl.allowed) return rateLimitResponseWith(rl, 10)

    const session = await requireAuth(req)

    const subscription = await db.subscription.findUnique({
      where: { userId: session.userId },
      select: { stripeCustomerId: true },
    })
    if (!subscription?.stripeCustomerId) {
      return Response.json({ success: false, error: 'No active subscription' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${appUrl}/dashboard/billing`,
    })

    return Response.json({ success: true, url: portalSession.url })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('POST /api/stripe/create-portal error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
