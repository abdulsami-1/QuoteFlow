import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

export const PLANS = {
  free:    { label: 'Free',    price: 0,   leadsPerMonth: 5,   priceId: null },
  starter: { label: 'Starter', price: 29,  leadsPerMonth: 50,  priceId: process.env.STRIPE_STARTER_PRICE_ID },
  pro:     { label: 'Pro',     price: 79,  leadsPerMonth: 200, priceId: process.env.STRIPE_PRO_PRICE_ID },
  agency:  { label: 'Agency',  price: 199, leadsPerMonth: -1,  priceId: process.env.STRIPE_AGENCY_PRICE_ID },
} as const

export type PlanKey = keyof typeof PLANS

export function getPlanFromPriceId(priceId: string | undefined): string {
  if (!priceId) return 'free'
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) return 'agency'
  return 'free'
}
