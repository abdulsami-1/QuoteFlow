'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, DollarSign, CheckCircle, BarChart2, ArrowUpRight, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LeadsBarChart } from '@/components/stats/leads-bar-chart'
import { StatusPieChart } from '@/components/stats/status-pie-chart'
import { NumberTicker } from '@/components/magicui/number-ticker'

interface StatsData {
  totalLeads: number
  leadsThisWeek: number
  avgQuoteValue: number
  conversionRate: number
  leadsPerDay: { date: string; count: number }[]
  statusDistribution: { status: string; count: number }[]
}

const METRICS = [
  {
    key: 'totalLeads' as const,
    label: 'Total Leads',
    prefix: '',
    suffix: '',
    decimalPlaces: 0,
    icon: Users,
    iconGradient: 'linear-gradient(135deg, rgba(99,102,241,0.28), rgba(167,139,250,0.14))',
    iconBorder: 'rgba(99,102,241,0.32)',
    iconColor: '#818CF8',
    accentLine: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.75), rgba(167,139,250,0.50), transparent)',
    cardBg: 'linear-gradient(135deg, rgba(99,102,241,0.09) 0%, transparent 65%)',
    trend: 'All time',
  },
  {
    key: 'leadsThisWeek' as const,
    label: 'This Week',
    prefix: '',
    suffix: '',
    decimalPlaces: 0,
    icon: TrendingUp,
    iconGradient: 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(99,102,241,0.10))',
    iconBorder: 'rgba(99,102,241,0.28)',
    iconColor: '#6366F1',
    accentLine: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.65), transparent)',
    cardBg: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, transparent 65%)',
    trend: 'Last 7 days',
  },
  {
    key: 'avgQuoteValue' as const,
    label: 'Avg Quote Value',
    prefix: '$',
    suffix: '',
    decimalPlaces: 0,
    icon: DollarSign,
    iconGradient: 'linear-gradient(135deg, rgba(212,168,67,0.26), rgba(232,197,107,0.12))',
    iconBorder: 'rgba(212,168,67,0.35)',
    iconColor: '#D4A843',
    accentLine: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.75), rgba(232,197,107,0.45), transparent)',
    cardBg: 'linear-gradient(135deg, rgba(212,168,67,0.08) 0%, transparent 65%)',
    trend: 'Per lead',
  },
  {
    key: 'conversionRate' as const,
    label: 'Conversion Rate',
    prefix: '',
    suffix: '%',
    decimalPlaces: 1,
    icon: CheckCircle,
    iconGradient: 'linear-gradient(135deg, rgba(34,197,94,0.24), rgba(74,222,128,0.12))',
    iconBorder: 'rgba(34,197,94,0.32)',
    iconColor: '#22C55E',
    accentLine: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.70), rgba(74,222,128,0.40), transparent)',
    cardBg: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, transparent 65%)',
    trend: 'Closed leads',
  },
]

function MetricCardSkeleton() {
  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
    >
      <div className="flex items-start justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  )
}

function ChartSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-55 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStats(json.data)
        } else {
          setError(json.error ?? 'Failed to load stats')
        }
      })
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* ─── Page header ──────────────────────────────────────────── */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[26px] font-black tracking-[-0.04em] leading-none text-gradient-heading">
              Analytics
            </h1>
          </div>
          <p className="text-[13px] text-fg-tertiary mt-1">
            Performance overview for your leads and quotes
          </p>
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-1.5">
          <span
            className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.06))',
              border: '1px solid rgba(34,197,94,0.25)',
              color: '#22C55E',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.8)' }}
              aria-hidden="true"
            />
            Live
          </span>
          <span className="text-[11px] text-fg-disabled">Auto-updated</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-danger/20 bg-danger-subtle px-4 py-3 text-[13px] text-danger">
          <span className="font-medium">Failed to load analytics.</span>
          <span className="text-danger/70">{error}</span>
        </div>
      )}

      {/* ─── Metric cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
          : METRICS.map((m, i) => {
              const Icon = m.icon
              const value = stats?.[m.key] ?? 0
              return (
                <motion.div
                  key={m.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.28, ease: 'easeOut' }}
                >
                  <div
                    className="relative rounded-2xl overflow-hidden group hover-lift cursor-default"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    {/* Card gradient bg */}
                    <div
                      className="card-tint-overlay pointer-events-none absolute inset-0"
                      aria-hidden="true"
                      style={{ background: m.cardBg }}
                    />

                    {/* Top accent line */}
                    <div
                      className="absolute top-0 inset-x-0 h-px"
                      style={{ background: m.accentLine }}
                      aria-hidden="true"
                    />

                    <div className="relative p-5">
                      {/* Icon + trend badge row */}
                      <div className="flex items-start justify-between mb-5">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{ background: m.iconGradient, border: `1px solid ${m.iconBorder}` }}
                        >
                          <Icon className="h-4.5 w-4.5" style={{ color: m.iconColor }} aria-hidden="true" />
                        </div>
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--fg-disabled)',
                          }}
                        >
                          <ArrowUpRight className="h-2.5 w-2.5" aria-hidden="true" />
                          {m.trend}
                        </span>
                      </div>

                      {/* Value */}
                      <NumberTicker
                        value={value}
                        prefix={m.prefix}
                        suffix={m.suffix}
                        decimalPlaces={m.decimalPlaces}
                        className="text-[34px] font-black leading-none tracking-[-0.05em] tabular-nums text-fg-primary"
                      />

                      {/* Label */}
                      <p className="text-[12px] text-fg-tertiary mt-2 font-medium">
                        {m.label}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
      </div>

      {/* ─── Charts section header ────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-3.5 w-3.5" style={{ color: '#D4A843' }} aria-hidden="true" />
        <h2 className="text-[11px] font-bold uppercase tracking-[0.10em] text-fg-disabled">
          Trends
        </h2>
        <div
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(90deg, var(--border-subtle), transparent)' }}
          aria-hidden="true"
        />
      </div>

      {/* ─── Charts ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {loading ? (
          <>
            <ChartSkeleton title="Leads — Last 30 Days" />
            <ChartSkeleton title="Status Breakdown" />
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.30, duration: 0.28, ease: 'easeOut' }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-wider">
                      Leads — Last 30 Days
                    </CardTitle>
                    <span
                      className="text-[11px] font-bold tabular-nums"
                      style={{ color: '#818CF8' }}
                    >
                      {stats?.leadsPerDay.reduce((s, d) => s + d.count, 0) ?? 0} total
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <LeadsBarChart data={stats?.leadsPerDay ?? []} />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.28, ease: 'easeOut' }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-wider">
                    Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <StatusPieChart data={stats?.statusDistribution ?? []} />
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
