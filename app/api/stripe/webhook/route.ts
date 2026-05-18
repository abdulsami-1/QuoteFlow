import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

// In-memory dedup for webhook events — prevents double-processing on Stripe retries
// within the same server instance. Replace with a DB table (WebhookEvent) for
// multi-instance deployments.
const processedEventIds = new Set<string>()

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (processedEventIds.has(event.id)) {
    return Response.json({ received: true, duplicate: true })
  }
  processedEventIds.add(event.id)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        const userId = checkoutSession.metadata?.userId
        if (!userId || !checkoutSession.subscription || !checkoutSession.customer) break

        const stripeSubscription = await stripe.subscriptions.retrieve(
          checkoutSession.subscription as string
        )

        const priceId = stripeSubscription.items.data[0]?.price.id
        const plan = getPlanFromPriceId(priceId)

        await db.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: checkoutSession.customer as string,
            stripeSubscriptionId: stripeSubscription.id,
            stripePriceId: priceId,
            plan,
            status: stripeSubscription.status,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          },
          update: {
            stripeCustomerId: checkoutSession.customer as string,
            stripeSubscriptionId: stripeSubscription.id,
            stripePriceId: priceId,
            plan,
            status: stripeSubscription.status,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          },
        })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await getUserIdFromCustomer(sub.customer as string)
        if (!userId) break

        const priceId = sub.items.data[0]?.price.id

        await db.subscription.update({
          where: { userId },
          data: {
            stripePriceId: priceId,
            plan: getPlanFromPriceId(priceId),
            status: sub.status,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await getUserIdFromCustomer(sub.customer as string)
        if (!userId) break

        await db.subscription.update({
          where: { userId },
          data: { plan: 'free', status: 'inactive', cancelAtPeriodEnd: false },
        })
        break
      }
    }
  } catch (err) {
    console.error('Stripe webhook handler error:', err)
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return Response.json({ received: true })
}

function getPlanFromPriceId(priceId: string | undefined): string {
  if (!priceId) return 'free'
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) return 'agency'
  return 'free'
}

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const sub = await db.subscription.findUnique({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  })
  return sub?.userId ?? null
}
