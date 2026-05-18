import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { stripe, PLANS } from '@/lib/stripe'
import { checkoutPlanSchema } from '@/lib/validations'
import { checkRateLimitWith, getClientIP, rateLimitResponseWith } from '@/lib/rate-limiter'

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req)
    const rl = checkRateLimitWith(ip, 10, 60 * 1000, 'stripe-checkout')
    if (!rl.allowed) return rateLimitResponseWith(rl, 10)

    const session = await requireAuth(req)

    const body = checkoutPlanSchema.safeParse(await req.json())
    if (!body.success) {
      return Response.json({ success: false, error: 'Invalid plan' }, { status: 400 })
    }
    const { plan } = body.data

    const planConfig = PLANS[plan]
    if (!planConfig.priceId) {
      return Response.json({ success: false, error: 'Invalid plan' }, { status: 400 })
    }

    const [user, subscription] = await Promise.all([
      db.user.findUnique({ where: { id: session.userId }, select: { email: true } }),
      db.subscription.findUnique({ where: { userId: session.userId }, select: { stripeCustomerId: true } }),
    ])
    if (!user) {
      console.error(`create-checkout: user not found for userId=${session.userId}`)
      return Response.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: subscription?.stripeCustomerId ?? undefined,
      customer_email: subscription?.stripeCustomerId ? undefined : user.email,
      line_items: [{ price: planConfig.priceId!, quantity: 1 }],
      success_url: `${appUrl}/dashboard/billing?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
      metadata: { userId: session.userId },
    })

    return Response.json({ success: true, url: checkoutSession.url })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('POST /api/stripe/create-checkout error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
