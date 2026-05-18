import { Suspense } from 'react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/session'
import { LeadsTable, LeadsTableSkeleton } from '@/components/leads/leads-table'
import { AddLeadButton } from '@/components/leads/add-lead-button'
import { Users, Flame, TrendingUp, ArrowUpRight, Layers, ArrowRight, Zap } from 'lucide-react'

export const metadata = { title: 'Leads — QuoteFlow' }

async function LeadsContent() {
  const cookieStore = await cookies()
  const token = cookieStore.get('qf_session')?.value ?? ''
  const session = await verifyToken(token)

  const config = await db.businessConfig.findUnique({
    where: { userId: session.userId },
    include: { services: { where: { isActive: true }, select: { id: true } } },
  })

  // Onboarding state — no services configured yet
  if (!config || config.services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.20), rgba(129,140,248,0.10))',
            border: '1px solid rgba(99,102,241,0.25)',
            boxShadow: '0 0 30px rgba(99,102,241,0.15)',
          }}
        >
          <Zap className="h-7 w-7 text-brand" aria-hidden="true" />
        </div>
        <h2 className="text-[20px] font-black text-fg-primary tracking-[-0.03em] mb-2">
          Welcome to QuoteFlow
        </h2>
        <p className="text-[13px] text-fg-secondary max-w-sm mb-6">
          Set up your first service to start capturing leads. Once a service is live, prospects can submit intake forms and you&apos;ll see their leads here.
        </p>
        <Link
          href="/dashboard/services"
          className="inline-flex items-center gap-2 rounded-md px-5 h-9 text-[13px] font-medium text-white transition-colors duration-150"
          style={{
            background: 'var(--brand)',
            boxShadow: '0 2px 10px rgba(99,102,241,0.35)',
          }}
        >
          <Layers className="h-3.5 w-3.5" aria-hidden="true" />
          Create First Service
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    )
  }

  const leads = await db.lead.findMany({
    where: { businessConfigId: config.id },
    include: { service: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = leads.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }))

  const newLeads    = leads.filter((l) => l.status === 'NEW').length
  const highUrgency = leads.filter((l) => l.urgencyFlag === 'HIGH').length
  const closedLeads = leads.filter((l) => l.status === 'CLOSED').length

  const stats = [
    {
      icon: Users,
      label: 'New Leads',
      value: newLeads,
      iconGradient: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(129,140,248,0.12))',
      iconBorder: 'rgba(99,102,241,0.30)',
      iconColor: '#818CF8',
      accentLine: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.65), rgba(129,140,248,0.40), transparent)',
      bg: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 60%)',
    },
    {
      icon: Flame,
      label: 'High Urgency',
      value: highUrgency,
      iconGradient: 'linear-gradient(135deg, rgba(248,113,113,0.22), rgba(239,68,68,0.10))',
      iconBorder: 'rgba(248,113,113,0.28)',
      iconColor: '#F87171',
      accentLine: 'linear-gradient(90deg, transparent, rgba(248,113,113,0.60), rgba(239,68,68,0.35), transparent)',
      bg: 'linear-gradient(135deg, rgba(248,113,113,0.07) 0%, transparent 60%)',
    },
    {
      icon: TrendingUp,
      label: 'Closed Won',
      value: closedLeads,
      iconGradient: 'linear-gradient(135deg, rgba(34,197,94,0.22), rgba(74,222,128,0.10))',
      iconBorder: 'rgba(34,197,94,0.28)',
      iconColor: '#22C55E',
      accentLine: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.60), rgba(74,222,128,0.35), transparent)',
      bg: 'linear-gradient(135deg, rgba(34,197,94,0.07) 0%, transparent 60%)',
    },
  ]

  return (
    <>
      {/* Page header */}
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1
              className="text-[26px] font-black tracking-[-0.04em] leading-none text-gradient-heading"
            >
              Leads
            </h1>
            {leads.length > 0 && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(129,140,248,0.12))',
                  border: '1px solid rgba(99,102,241,0.25)',
                  color: '#818CF8',
                }}
              >
                {leads.length}
              </span>
            )}
          </div>
          <p className="text-[13px] text-fg-tertiary">
            {leads.length === 0
              ? 'No leads yet — share your embed code to start capturing'
              : 'Manage and track your incoming prospects'}
          </p>
        </div>

        <AddLeadButton />
      </div>

      {/* Quick-stats strip */}
      {leads.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="relative overflow-hidden flex items-center gap-3.5 rounded-2xl px-4 py-4 group hover-lift"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div
                  className="card-tint-overlay pointer-events-none absolute inset-0"
                  aria-hidden="true"
                  style={{ background: stat.bg }}
                />
                <div
                  className="pointer-events-none absolute top-0 inset-x-0 h-px"
                  aria-hidden="true"
                  style={{ background: stat.accentLine }}
                />
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl relative z-10"
                  style={{
                    background: stat.iconGradient,
                    border: `1px solid ${stat.iconBorder}`,
                  }}
                >
                  <Icon className="h-4.5 w-4.5" style={{ color: stat.iconColor }} aria-hidden="true" />
                </div>
                <div className="min-w-0 relative z-10">
                  <p className="text-[26px] font-black leading-none tracking-[-0.04em] tabular-nums text-fg-primary">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-fg-secondary mt-1">{stat.label}</p>
                </div>
                <ArrowUpRight
                  className="h-3.5 w-3.5 absolute top-3.5 right-3.5 text-fg-disabled opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-hidden="true"
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <LeadsTable leads={serialized} />
      </div>
    </>
  )
}

export default function LeadsPage() {
  return (
    <Suspense
      fallback={
        <div>
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <div className="h-7 w-24 bg-elevated rounded-lg animate-pulse" />
              <div className="h-3.5 w-40 bg-elevated rounded animate-pulse mt-2" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl animate-pulse"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
              />
            ))}
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <LeadsTableSkeleton />
          </div>
        </div>
      }
    >
      <LeadsContent />
    </Suspense>
  )
}
