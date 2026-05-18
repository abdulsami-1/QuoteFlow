import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { stripe, getPlanFromPriceId } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const session = await requireAuth(req)
    const body = await req.json()
    const sessionId = body?.sessionId

    if (!sessionId || typeof sessionId !== 'string') {
      return Response.json({ success: false, error: 'Missing sessionId' }, { status: 400 })
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)

    if (checkoutSession.metadata?.userId !== session.userId) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    if (checkoutSession.payment_status !== 'paid') {
      return Response.json({ success: false, error: 'Payment not completed' }, { status: 400 })
    }

    if (!checkoutSession.subscription || !checkoutSession.customer) {
      return Response.json({ success: false, error: 'No subscription on session' }, { status: 400 })
    }

    const stripeSub = await stripe.subscriptions.retrieve(checkoutSession.subscription as string)
    const priceId = stripeSub.items.data[0]?.price.id
    const plan = getPlanFromPriceId(priceId)

    await db.subscription.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        stripeCustomerId: checkoutSession.customer as string,
        stripeSubscriptionId: stripeSub.id,
        stripePriceId: priceId,
        plan,
        status: stripeSub.status,
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      },
      update: {
        stripeCustomerId: checkoutSession.customer as string,
        stripeSubscriptionId: stripeSub.id,
        stripePriceId: priceId,
        plan,
        status: stripeSub.status,
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      },
    })

    console.error('[stripe/sync] plan synced', { userId: session.userId, priceId, plan })
    return Response.json({ success: true, plan })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('POST /api/stripe/sync error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
