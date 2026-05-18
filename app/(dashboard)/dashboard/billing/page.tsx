import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/session'
import { BillingCards } from '@/components/billing/billing-cards'
import { CreditCard } from 'lucide-react'

export const metadata = { title: 'Billing — QuoteFlow' }

export default async function BillingPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('qf_session')?.value ?? ''
  const session = await verifyToken(token)

  const subscription = await db.subscription.findUnique({
    where: { userId: session.userId },
    select: { plan: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true, stripeCustomerId: true },
  })

  const currentPlan = subscription?.plan ?? 'free'
  const hasStripe = !!subscription?.stripeCustomerId

  return (
    <div className="pt-16 lg:pt-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(129,140,248,0.12))',
              border: '1px solid rgba(99,102,241,0.30)',
            }}
          >
            <CreditCard className="h-4 w-4 text-brand" aria-hidden="true" />
          </div>
          <h1 className="text-[22px] font-bold text-fg-primary tracking-[-0.03em]">Billing</h1>
        </div>
        <p className="text-[13px] text-fg-secondary ml-11">
          Manage your subscription and usage limits.
        </p>
      </div>

      {subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
        <div
          className="mb-6 rounded-lg px-4 py-3 text-[13px] text-warning border"
          style={{ background: 'rgba(251,191,36,0.07)', borderColor: 'rgba(251,191,36,0.25)' }}
        >
          Your subscription will cancel on{' '}
          <strong>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</strong>.
          Reactivate anytime before then to keep access.
        </div>
      )}

      <BillingCards currentPlan={currentPlan} hasStripe={hasStripe} />
    </div>
  )
}
