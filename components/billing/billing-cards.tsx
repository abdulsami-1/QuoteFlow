'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Zap, Shield, Building2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const PLANS = [
  {
    key: 'starter',
    label: 'Starter',
    price: 29,
    leads: '50 leads / month',
    icon: Zap,
    accentLine: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.8), rgba(167,139,250,0.5), transparent)',
    cardBg: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 60%)',
    iconBg: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(167,139,250,0.12))',
    iconBorder: 'rgba(99,102,241,0.32)',
    iconColor: '#818CF8',
    features: ['50 leads per month', 'AI-powered summaries', 'Email notifications', 'Embed widget', 'Analytics dashboard'],
    popular: false,
  },
  {
    key: 'pro',
    label: 'Pro',
    price: 79,
    leads: '200 leads / month',
    icon: Shield,
    accentLine: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.9), rgba(192,132,252,0.6), transparent)',
    cardBg: 'linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(167,139,250,0.05) 60%)',
    iconBg: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(192,132,252,0.12))',
    iconBorder: 'rgba(139,92,246,0.35)',
    iconColor: '#A78BFA',
    features: ['200 leads per month', 'Everything in Starter', 'Priority support', 'Custom branding', 'Advanced analytics'],
    popular: true,
  },
  {
    key: 'agency',
    label: 'Agency',
    price: 199,
    leads: 'Unlimited leads',
    icon: Building2,
    accentLine: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.8), rgba(232,197,107,0.5), transparent)',
    cardBg: 'linear-gradient(135deg, rgba(212,168,67,0.08) 0%, transparent 60%)',
    iconBg: 'linear-gradient(135deg, rgba(212,168,67,0.24), rgba(232,197,107,0.12))',
    iconBorder: 'rgba(212,168,67,0.35)',
    iconColor: '#D4A843',
    features: ['Unlimited leads', 'Everything in Pro', 'Multiple businesses', 'White-label widget', 'Dedicated support'],
    popular: false,
  },
] as const

interface BillingCardsProps {
  currentPlan: string
  hasStripe: boolean
}

export function BillingCards({ currentPlan, hasStripe }: BillingCardsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [activating, setActivating] = useState(false)
  const [plan, setPlan] = useState(currentPlan)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Keep local plan state in sync when server re-renders
  useEffect(() => { setPlan(currentPlan) }, [currentPlan])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (!params.has('success')) return

    const sessionId = params.get('session_id')
    window.history.replaceState({}, '', window.location.pathname)

    // Webhook already fired before redirect — just confirm
    if (currentPlan !== 'free') {
      toast.success('Plan activated! Welcome to ' + currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1))
      return
    }

    setActivating(true)

    if (sessionId) {
      // Direct sync: don't wait for webhook
      fetch('/api/stripe/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then((r) => r.json())
        .then((json) => {
          setActivating(false)
          if (json.success) {
            setPlan(json.plan as string)
            router.refresh()
            toast.success('Plan activated! Welcome to ' + (json.plan as string).charAt(0).toUpperCase() + (json.plan as string).slice(1))
          } else {
            toast.error('Payment received but activation failed — please refresh.')
          }
        })
        .catch(() => {
          setActivating(false)
          toast.error('Payment received but activation failed — please refresh.')
        })
      return
    }

    // Fallback: no session_id, poll router.refresh() until plan updates
    let count = 0
    pollRef.current = setInterval(() => {
      count++
      router.refresh()
      if (count >= 15) {
        clearInterval(pollRef.current!)
        pollRef.current = null
        setActivating(false)
      }
    }, 2000)

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  // Polling fallback: stop when server re-renders with updated plan
  useEffect(() => {
    if (activating && plan !== 'free' && pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
      setActivating(false)
      toast.success('Plan activated! Welcome to ' + plan.charAt(0).toUpperCase() + plan.slice(1))
    }
  }, [plan, activating])

  async function handleUpgrade(planKey: string) {
    setLoading(planKey)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Failed to start checkout')
        return
      }
      window.location.href = json.url
    } catch {
      toast.error('Failed to connect to billing')
    } finally {
      setLoading(null)
    }
  }

  async function handleManage() {
    setLoading('portal')
    try {
      const res = await fetch('/api/stripe/create-portal', { method: 'POST' })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Failed to open billing portal')
        return
      }
      window.location.href = json.url
    } catch {
      toast.error('Failed to connect to billing')
    } finally {
      setLoading(null)
    }
  }

  const isFree = plan === 'free'

  return (
    <div className="space-y-6">
      {/* ── Activation banner ── */}
      {activating && (
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-3.5"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(167,139,250,0.07) 100%)',
            border: '1px solid rgba(99,102,241,0.28)',
          }}
        >
          <Loader2 className="h-4 w-4 animate-spin shrink-0" style={{ color: '#818CF8' }} aria-hidden="true" />
          <p className="text-[13px] text-fg-secondary">Activating your plan&hellip; this may take a few seconds.</p>
        </div>
      )}
      {/* ── Current plan strip ── */}
      <div
        className="relative rounded-2xl px-5 py-4 flex items-center justify-between overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }}
          aria-hidden="true"
        />
        <div>
          <p className="text-[10px] text-fg-tertiary uppercase tracking-widest font-bold mb-0.5">Current plan</p>
          <p className="text-[16px] font-black text-fg-primary capitalize tracking-[-0.02em]">{plan}</p>
          {isFree && (
            <p className="text-[12px] text-fg-tertiary mt-0.5">5 leads / month included for free</p>
          )}
        </div>
        {hasStripe && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleManage}
            disabled={loading === 'portal'}
            className="gap-2"
          >
            {loading === 'portal' && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            Manage Subscription
          </Button>
        )}
      </div>

      {/* ── Plan cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((planConfig, i) => {
          const Icon = planConfig.icon
          const isCurrent = plan === planConfig.key
          const isLoading = loading === planConfig.key

          return (
            <motion.div
              key={planConfig.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.26, ease: 'easeOut' }}
              className="relative rounded-2xl flex flex-col overflow-hidden transition-all duration-200 hover-lift"
              style={{
                background: isCurrent
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(99,102,241,0.06) 100%)'
                  : 'var(--bg-surface)',
                border: isCurrent
                  ? '1px solid rgba(99,102,241,0.40)'
                  : planConfig.popular
                  ? '1px solid rgba(99,102,241,0.22)'
                  : '1px solid var(--border-default)',
                boxShadow: isCurrent
                  ? 'var(--shadow-brand)'
                  : 'var(--shadow-md)',
              }}
            >
              {/* Card bg tint */}
              <div
                className="card-tint-overlay pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{ background: planConfig.cardBg }}
              />

              {/* Top accent line */}
              <div
                className="absolute top-0 inset-x-0 h-px"
                style={{ background: planConfig.accentLine }}
                aria-hidden="true"
              />

              {/* Popular badge */}
              {planConfig.popular && (
                <div className="absolute -top-px left-0 right-0 flex justify-center">
                  <div
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-b-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.90), rgba(167,139,250,0.85))',
                      color: 'white',
                      boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                    }}
                  >
                    <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                    Most popular
                  </div>
                </div>
              )}

              <div className="relative p-5 flex flex-col h-full" style={{ paddingTop: planConfig.popular ? '32px' : '20px' }}>
                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                    style={{ background: planConfig.iconBg, border: `1px solid ${planConfig.iconBorder}` }}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ color: planConfig.iconColor }} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-fg-primary">{planConfig.label}</p>
                    <p className="text-[11px] text-fg-tertiary">{planConfig.leads}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <span className="text-[34px] font-black tracking-[-0.05em] tabular-nums" style={{ color: planConfig.iconColor }}>
                    ${planConfig.price}
                  </span>
                  <span className="text-[13px] text-fg-tertiary ml-1">/month</span>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {planConfig.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="text-[12px] text-fg-secondary">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <Button variant="secondary" size="sm" disabled className="w-full">
                    Current plan
                  </Button>
                ) : (
                  <Button
                    variant={planConfig.popular ? 'default' : 'outline'}
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => handleUpgrade(planConfig.key)}
                    disabled={!!loading}
                  >
                    {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                    {isLoading ? 'Redirecting…' : 'Upgrade'}
                  </Button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
