import { headers } from 'next/headers'
import { stripe, getPlanFromPriceId } from '@/lib/stripe'
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
        if (!userId || !checkoutSession.subscription || !checkoutSession.customer) {
          console.error('[stripe/webhook] checkout.session.completed missing required fields', {
            eventId: event.id,
            hasUserId: !!userId,
            hasSubscription: !!checkoutSession.subscription,
            hasCustomer: !!checkoutSession.customer,
          })
          break
        }

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
        console.error('[stripe/webhook] checkout.session.completed — plan activated', { eventId: event.id, userId, priceId, plan })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await getUserIdFromCustomer(sub.customer as string)
        if (!userId) {
          console.error('[stripe/webhook] customer.subscription.updated — userId not found', { eventId: event.id, customerId: sub.customer })
          break
        }

        const priceId = sub.items.data[0]?.price.id
        const plan = getPlanFromPriceId(priceId)

        await db.subscription.update({
          where: { userId },
          data: {
            stripePriceId: priceId,
            plan,
            status: sub.status,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        })
        console.error('[stripe/webhook] customer.subscription.updated', { eventId: event.id, userId, priceId, plan, status: sub.status })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await getUserIdFromCustomer(sub.customer as string)
        if (!userId) {
          console.error('[stripe/webhook] customer.subscription.deleted — userId not found', { eventId: event.id, customerId: sub.customer })
          break
        }

        await db.subscription.update({
          where: { userId },
          data: { plan: 'free', status: 'inactive', cancelAtPeriodEnd: false },
        })
        console.error('[stripe/webhook] customer.subscription.deleted — downgraded to free', { eventId: event.id, userId })
        break
      }

      default:
        console.error('[stripe/webhook] unhandled event type', { type: event.type, eventId: event.id })
    }
  } catch (err) {
    console.error('[stripe/webhook] handler error', { eventId: event.id, type: event.type, err })
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return Response.json({ received: true })
}

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const sub = await db.subscription.findUnique({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  })
  return sub?.userId ?? null
}
