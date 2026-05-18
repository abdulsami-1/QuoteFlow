import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verifyToken } from '@/lib/session'
import {
  Zap,
  ArrowRight,
  BarChart2,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Shield,
  Star,
  Users,
  Code2,
  DollarSign,
  Bell,
  ChevronRight,
  Check,
} from 'lucide-react'
import { HomeThemeToggle } from '@/components/ui/home-theme-toggle'

async function getSession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('qf_session')?.value
    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}

/* ─── Data ─────────────────────────────────────────────── */

const features = [
  {
    icon: MessageSquare,
    label: 'AI Intake',
    title: 'Conversational quote forms',
    description: 'A smart chat-style widget asks the right questions and qualifies every visitor in real time — no manual follow-up.',
    color: '#818CF8',
    glow: 'rgba(99,102,241,0.20)',
    border: 'rgba(99,102,241,0.28)',
    accent: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(167,139,250,0.5), transparent)',
    bg: 'linear-gradient(160deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 70%)',
  },
  {
    icon: Zap,
    label: 'Instant Estimates',
    title: 'Real-time pricing engine',
    description: 'Keyword-matched rules generate a personalised estimate the moment someone finishes the intake — zero manual work.',
    color: '#D4A843',
    glow: 'rgba(212,168,67,0.20)',
    border: 'rgba(212,168,67,0.28)',
    accent: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.8), rgba(232,197,107,0.5), transparent)',
    bg: 'linear-gradient(160deg, rgba(212,168,67,0.12) 0%, rgba(212,168,67,0.04) 70%)',
  },
  {
    icon: BarChart2,
    label: 'Lead CRM',
    title: 'Full pipeline in one view',
    description: 'Every lead lands with an AI summary, urgency flag, and quote range. Filter, export, and close from one clean dashboard.',
    color: '#22C55E',
    glow: 'rgba(34,197,94,0.20)',
    border: 'rgba(34,197,94,0.28)',
    accent: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.75), rgba(74,222,128,0.4), transparent)',
    bg: 'linear-gradient(160deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.04) 70%)',
  },
  {
    icon: Bell,
    label: 'Real-time Alerts',
    title: 'Instant lead notifications',
    description: 'Get email alerts the second a lead submits, with urgency scores and quote ranges included — never miss a hot prospect.',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.20)',
    border: 'rgba(245,158,11,0.28)',
    accent: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.75), rgba(252,211,77,0.4), transparent)',
    bg: 'linear-gradient(160deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 70%)',
  },
  {
    icon: Code2,
    label: 'One-Line Embed',
    title: 'Paste once, works everywhere',
    description: 'A single script tag embeds your fully branded, mobile-ready intake widget on any site or landing page.',
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.20)',
    border: 'rgba(167,139,250,0.28)',
    accent: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.8), rgba(192,132,252,0.5), transparent)',
    bg: 'linear-gradient(160deg, rgba(167,139,250,0.12) 0%, rgba(167,139,250,0.04) 70%)',
  },
  {
    icon: Shield,
    label: 'Secure & Private',
    title: 'Enterprise-grade security',
    description: 'JWT-based sessions, rate limiting, CORS-restricted intake endpoints, and encrypted credentials throughout.',
    color: '#34D399',
    glow: 'rgba(52,211,153,0.20)',
    border: 'rgba(52,211,153,0.28)',
    accent: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.75), rgba(110,231,183,0.4), transparent)',
    bg: 'linear-gradient(160deg, rgba(52,211,153,0.12) 0%, rgba(52,211,153,0.04) 70%)',
  },
]

const steps = [
  {
    number: '01',
    title: 'Configure your services',
    description: 'Add services, write 2–7 intake questions, set keyword-based pricing tiers. Done in under 5 minutes.',
    color: '#818CF8',
    glow: 'rgba(99,102,241,0.40)',
    border: 'rgba(99,102,241,0.30)',
    bg: 'rgba(99,102,241,0.14)',
  },
  {
    number: '02',
    title: 'Embed on your site',
    description: 'Paste one line of script on any webpage. The widget is responsive, branded, and fully hosted.',
    color: '#D4A843',
    glow: 'rgba(212,168,67,0.40)',
    border: 'rgba(212,168,67,0.30)',
    bg: 'rgba(212,168,67,0.14)',
  },
  {
    number: '03',
    title: 'Receive qualified leads',
    description: 'Instant email alerts, AI summaries, urgency flags, and quote ranges — straight to your dashboard.',
    color: '#22C55E',
    glow: 'rgba(34,197,94,0.40)',
    border: 'rgba(34,197,94,0.30)',
    bg: 'rgba(34,197,94,0.14)',
  },
]

const plans = [
  {
    key: 'free',
    label: 'Free',
    price: 0,
    desc: 'Try QuoteFlow risk-free.',
    features: ['5 leads / month', 'AI-powered summaries', 'Embed widget', 'Email notifications', 'Lead dashboard'],
    cta: 'Get started free',
    href: '/signup',
    popular: false,
    highlight: false,
  },
  {
    key: 'starter',
    label: 'Starter',
    price: 29,
    desc: 'Perfect for solo operators.',
    features: ['50 leads / month', 'Everything in Free', 'Analytics dashboard', 'CSV export', 'Priority alerts'],
    cta: 'Start Starter',
    href: '/signup',
    popular: false,
    highlight: false,
  },
  {
    key: 'pro',
    label: 'Pro',
    price: 79,
    desc: 'For growing service businesses.',
    features: ['200 leads / month', 'Everything in Starter', 'Custom branding', 'Priority support', 'Advanced analytics'],
    cta: 'Start Pro',
    href: '/signup',
    popular: true,
    highlight: true,
  },
  {
    key: 'agency',
    label: 'Agency',
    price: 199,
    desc: 'Run multiple businesses.',
    features: ['Unlimited leads', 'Everything in Pro', 'Multiple businesses', 'White-label widget', 'Dedicated support'],
    cta: 'Start Agency',
    href: '/signup',
    popular: false,
    highlight: false,
  },
]

const stats = [
  { value: '< 5 min', label: 'Setup time',   icon: Zap },
  { value: '100%',    label: 'Automated',    icon: TrendingUp },
  { value: '24/7',    label: 'Lead capture', icon: Users },
]

const navLinks = [
  { href: '#features',     label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing',      label: 'Pricing' },
]

/* ─── Component ─────────────────────────────────────────── */

export default async function HomePage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-15%] left-[-8%] h-[900px] w-[900px] rounded-full animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 60%)', filter: 'blur(120px)' }} />
        <div className="absolute top-[35%] right-[-10%] h-[700px] w-[700px] rounded-full animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.09) 0%, transparent 60%)', filter: 'blur(100px)', animationDelay: '-7s' }} />
        <div className="absolute bottom-[5%] left-[20%] h-[600px] w-[600px] rounded-full animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 60%)', filter: 'blur(120px)', animationDelay: '-14s' }} />
      </div>
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" aria-hidden="true" />

      {/* ══════════════════════════════════════
          NAVBAR
          ══════════════════════════════════════ */}
      <header
        className="fixed top-0 inset-x-0 z-50"
        style={{
          background: 'var(--topbar-bg)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid var(--topbar-border)',
          boxShadow: '0 1px 32px rgba(0,0,0,0.12)',
        }}
      >
        <nav className="flex items-center justify-between px-6 h-[60px] max-w-6xl mx-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-[9px]"
              style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)', boxShadow: '0 4px 16px rgba(99,102,241,0.50)' }}
            >
              <Zap className="h-[15px] w-[15px] text-white" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <span className="text-[15px] font-bold tracking-[-0.025em]" style={{ color: 'var(--fg-primary)' }}>QuoteFlow</span>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-150 text-fg-tertiary hover:text-fg-primary"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <HomeThemeToggle />
            <Link
              href="/login"
              className="hidden sm:inline-flex h-9 items-center px-4 text-[13px] font-medium rounded-lg transition-all duration-150"
              style={{ color: 'var(--fg-secondary)', border: '1px solid var(--border-strong)' }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-px"
              style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)', boxShadow: '0 4px 18px rgba(99,102,241,0.45)' }}
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ══════════════════════════════════════
          HERO
          ══════════════════════════════════════ */}
      <section className="relative z-10 pt-44 pb-28 px-6 text-center max-w-5xl mx-auto">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-10 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: 'linear-gradient(135deg, rgba(212,168,67,0.15), rgba(99,102,241,0.10))',
            border: '1px solid rgba(212,168,67,0.40)',
            color: '#E2B95A',
          }}
        >
          <Star className="h-3 w-3 shrink-0" style={{ color: '#E2B95A' }} aria-hidden="true" />
          AI-Powered Quote Generation
        </div>

        {/* Headline */}
        <h1 className="text-[52px] sm:text-[72px] lg:text-[88px] font-black leading-[0.96] tracking-[-0.055em] mb-6 max-w-[880px] mx-auto"
          style={{ color: 'var(--fg-primary)' }}>
          Quote smarter.{' '}
          <span
            className="block"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 30%, #A78BFA 60%, #D4A843 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Close faster.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-[18px] sm:text-[20px] leading-relaxed max-w-[540px] mx-auto mb-10 font-normal"
          style={{ color: 'var(--fg-secondary)' }}>
          Embed a conversational intake widget that qualifies leads and delivers
          instant AI estimates — while you sleep.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-14">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2.5 h-12 px-9 rounded-xl text-[15px] font-bold transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #D4A843 0%, #E8C56B 50%, #C9A227 100%)', boxShadow: '0 6px 32px rgba(212,168,67,0.50)', color: '#0A0800' }}
          >
            Start for free
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 h-12 px-8 rounded-xl text-[15px] font-medium transition-all duration-150"
            style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-secondary)' }}
          >
            Sign in
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Stats strip */}
        <div
          className="inline-flex items-stretch rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border-default)', background: 'var(--glass-bg)' }}
        >
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className="flex items-center gap-3 px-7 py-4"
                style={i > 0 ? { borderLeft: '1px solid var(--border-subtle)' } : undefined}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: '#818CF8' }} aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-[22px] font-black leading-none tabular-nums"
                    style={{ background: 'linear-gradient(135deg, #818CF8, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  >
                    {s.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.12em] mt-1 font-semibold"
                    style={{ color: 'var(--fg-tertiary)' }}>
                    {s.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-[12px] mt-5" style={{ color: 'var(--fg-disabled)' }}>
          Free forever plan · Works on any website · Up in 5 minutes
        </p>
      </section>

      {/* ══════════════════════════════════════
          PRODUCT PREVIEW  (intentionally always dark — UI mockup)
          ══════════════════════════════════════ */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto mb-32">
        {/* Glow under preview */}
        <div className="absolute inset-x-12 top-6 h-24 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)', filter: 'blur(32px)' }}
          aria-hidden="true"
        />

        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.50), rgba(167,139,250,0.28), rgba(212,168,67,0.32))',
            padding: '1px',
          }}
        >
          <div
            className="rounded-2xl px-6 py-7"
            style={{ background: 'linear-gradient(160deg, #0D0C22 0%, #0A0918 60%, #080810 100%)' }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 mb-6">
              <span className="h-3 w-3 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="h-3 w-3 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="h-3 w-3 rounded-full" style={{ background: '#28C840' }} />
              <div
                className="flex-1 ml-3 h-6 rounded-md flex items-center px-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.30)' }}>app.quoteflow.io/dashboard/leads</span>
              </div>
            </div>

            {/* Mock lead rows */}
            <div className="space-y-2">
              {[
                { name: 'Sarah Mitchell',  email: 'sarah@designco.com',  service: 'Web Design',      quote: '$2,400–$3,800',  status: 'NEW',       urgency: 'HIGH' },
                { name: 'James Thornton', email: 'james@buildright.io', service: 'Home Renovation', quote: '$8,500–$12,000', status: 'CONTACTED', urgency: 'LOW'  },
                { name: 'Emily Chen',     email: 'emily@marketpro.com', service: 'SEO Package',     quote: '$1,200–$1,900',  status: 'CLOSED',    urgency: 'LOW'  },
              ].map((lead) => (
                <div
                  key={lead.name}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{ background: 'rgba(99,102,241,0.20)', color: '#A78BFA', border: '1.5px solid rgba(99,102,241,0.30)' }}
                  >
                    {lead.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold truncate" style={{ color: 'rgba(255,255,255,0.90)' }}>{lead.name}</p>
                    <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{lead.email}</p>
                  </div>
                  <span className="hidden sm:block text-[12px] shrink-0" style={{ color: 'rgba(255,255,255,0.50)' }}>{lead.service}</span>
                  <span
                    className="hidden md:block text-[13px] font-bold tabular-nums shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  >
                    {lead.quote}
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wide"
                    style={{
                      background: lead.status === 'NEW' ? 'rgba(99,102,241,0.18)' : lead.status === 'CONTACTED' ? 'rgba(245,158,11,0.18)' : 'rgba(34,197,94,0.18)',
                      color: lead.status === 'NEW' ? '#818CF8' : lead.status === 'CONTACTED' ? '#F59E0B' : '#22C55E',
                      border: `1px solid ${lead.status === 'NEW' ? 'rgba(99,102,241,0.30)' : lead.status === 'CONTACTED' ? 'rgba(245,158,11,0.30)' : 'rgba(34,197,94,0.30)'}`,
                    }}
                  >
                    {lead.status}
                  </span>
                  <span
                    className="hidden sm:block text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wide"
                    style={{
                      background: lead.urgency === 'HIGH' ? 'rgba(248,113,113,0.18)' : 'rgba(107,114,128,0.12)',
                      color: lead.urgency === 'HIGH' ? '#F87171' : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {lead.urgency}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom metrics */}
            <div className="flex items-center gap-5 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.8)' }} />
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.40)' }}>3 leads today</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.40)' }}>
                Avg quote: <strong style={{ color: 'rgba(255,255,255,0.65)' }}>$4,350</strong>
              </span>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.40)' }}>
                Conversion: <strong style={{ color: '#22C55E' }}>33%</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
          ══════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-28 px-6 max-w-6xl mx-auto" aria-label="Features">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-5 text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.28)', color: '#818CF8' }}
          >
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Everything you need
          </div>
          <h2 className="text-[38px] sm:text-[50px] font-black tracking-[-0.045em] leading-[1.04] mb-4"
            style={{ color: 'var(--fg-primary)' }}>
            Built for service businesses
          </h2>
          <p className="text-[17px] max-w-md mx-auto leading-relaxed"
            style={{ color: 'var(--fg-secondary)' }}>
            From first site visit to qualified lead — in minutes, not days.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="relative rounded-2xl p-6 group hover-lift overflow-hidden"
                style={{ background: feat.bg, border: `1px solid ${feat.border}` }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 inset-x-0 h-px" style={{ background: feat.accent }} aria-hidden="true" />

                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl mb-5"
                  style={{ background: feat.glow, border: `1px solid ${feat.border}` }}
                >
                  <Icon className="h-5 w-5" style={{ color: feat.color }} aria-hidden="true" />
                </div>

                <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: feat.color }}>
                  {feat.label}
                </p>
                <h3 className="text-[16px] font-bold tracking-[-0.02em] mb-2.5 leading-snug" style={{ color: 'var(--fg-primary)' }}>
                  {feat.title}
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
                  {feat.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 py-28 px-6 max-w-6xl mx-auto" aria-label="How it works">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-5 text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.30)', color: '#D4A843' }}
          >
            <Zap className="h-3 w-3" aria-hidden="true" />
            Three steps
          </div>
          <h2 className="text-[38px] sm:text-[50px] font-black tracking-[-0.045em] leading-[1.04] mb-4"
            style={{ color: 'var(--fg-primary)' }}>
            Up and running in minutes
          </h2>
          <p className="text-[17px] max-w-md mx-auto leading-relaxed"
            style={{ color: 'var(--fg-secondary)' }}>
            No developers, no complex setup — just configure, embed, and capture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div
            className="hidden md:block absolute top-9 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px"
            style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.5), rgba(212,168,67,0.35), rgba(34,197,94,0.35))' }}
            aria-hidden="true"
          />

          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-2xl p-7 group hover-lift"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-default)' }}
            >
              <div
                className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6"
                style={{ background: step.bg, border: `1px solid ${step.border}`, boxShadow: `0 0 28px ${step.glow}` }}
              >
                <span className="text-[24px] font-black tabular-nums" style={{ color: step.color }}>
                  {step.number}
                </span>
              </div>
              <h3 className="text-[18px] font-bold tracking-[-0.025em] mb-3 leading-tight" style={{ color: 'var(--fg-primary)' }}>
                {step.title}
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRICING
          ══════════════════════════════════════ */}
      <section id="pricing" className="relative z-10 py-28 px-6 max-w-6xl mx-auto" aria-label="Pricing">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-5 text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)', color: '#22C55E' }}
          >
            <DollarSign className="h-3 w-3" aria-hidden="true" />
            Simple pricing
          </div>
          <h2 className="text-[38px] sm:text-[50px] font-black tracking-[-0.045em] leading-[1.04] mb-4"
            style={{ color: 'var(--fg-primary)' }}>
            Start free, scale when ready
          </h2>
          <p className="text-[17px] max-w-md mx-auto leading-relaxed"
            style={{ color: 'var(--fg-secondary)' }}>
            Every plan includes AI summaries, email alerts, and the embed widget. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className="relative rounded-2xl p-6 flex flex-col"
              style={{
                background: plan.highlight
                  ? 'linear-gradient(160deg, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.07) 100%)'
                  : 'var(--glass-bg)',
                border: plan.highlight
                  ? '1px solid rgba(99,102,241,0.45)'
                  : '1px solid var(--border-default)',
                boxShadow: plan.highlight ? '0 0 40px rgba(99,102,241,0.20)' : 'none',
              }}
            >
              {/* Top accent */}
              {plan.highlight && (
                <div
                  className="absolute top-0 inset-x-0 h-px rounded-t-2xl"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.9), rgba(167,139,250,0.7), transparent)' }}
                  aria-hidden="true"
                />
              )}

              {/* Popular badge */}
              {plan.popular && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.10em] px-3.5 py-1 rounded-full whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #A78BFA)', color: 'white', boxShadow: '0 2px 14px rgba(99,102,241,0.55)' }}
                >
                  Most popular
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <p className="text-[12px] font-bold uppercase tracking-[0.10em] mb-3" style={{ color: 'var(--fg-tertiary)' }}>
                  {plan.label}
                </p>
                <div className="flex items-baseline gap-1">
                  {plan.price === 0 ? (
                    <span className="text-[40px] font-black tracking-[-0.04em]" style={{ color: 'var(--fg-primary)' }}>Free</span>
                  ) : (
                    <>
                      <span className="text-[22px] font-bold" style={{ color: 'var(--fg-secondary)' }}>$</span>
                      <span className="text-[40px] font-black tracking-[-0.04em]" style={{ color: 'var(--fg-primary)' }}>{plan.price}</span>
                      <span className="text-[13px]" style={{ color: 'var(--fg-tertiary)' }}>/mo</span>
                    </>
                  )}
                </div>
                <p className="text-[12px] mt-1.5" style={{ color: 'var(--fg-tertiary)' }}>{plan.desc}</p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: '#22C55E' }} aria-hidden="true" />
                    <span className="text-[13px]" style={{ color: 'var(--fg-secondary)' }}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-[13px] font-semibold transition-all duration-150 hover:-translate-y-px"
                style={plan.highlight ? {
                  background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                  boxShadow: '0 4px 18px rgba(99,102,241,0.45)',
                  color: 'white',
                } : {
                  background: 'var(--glass-bg-hover)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--fg-secondary)',
                }}
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-[12px] mt-8" style={{ color: 'var(--fg-disabled)' }}>
          All plans include AI summaries · Embed widget · Email alerts
        </p>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA  (intentionally always dark)
          ══════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6" aria-label="Call to action">
        <div
          className="relative max-w-3xl mx-auto text-center overflow-hidden rounded-3xl px-8 py-20"
          style={{
            background: 'linear-gradient(160deg, #0E0D26 0%, #0A0920 60%, #080812 100%)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.70)',
          }}
        >
          {/* Iridescent border */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'linear-gradient(#0E0D26, #0E0D26) padding-box, linear-gradient(135deg, rgba(99,102,241,0.65) 0%, rgba(167,139,250,0.35) 35%, rgba(212,168,67,0.50) 65%, rgba(99,102,241,0.55) 100%) border-box',
              border: '1px solid transparent',
            }}
            aria-hidden="true"
          />

          {/* Glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="h-96 w-96 rounded-full animate-glow-pulse"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)', filter: 'blur(28px)' }} />
          </div>
          <div className="pointer-events-none absolute top-[-30px] right-[8%]" aria-hidden="true">
            <div className="h-64 w-64 rounded-full animate-glow-gold"
              style={{ background: 'radial-gradient(circle, rgba(212,168,67,0.14) 0%, transparent 65%)', filter: 'blur(32px)' }} />
          </div>

          {/* Icon */}
          <div
            className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-8"
            style={{ background: 'rgba(99,102,241,0.20)', border: '1px solid rgba(99,102,241,0.40)', boxShadow: '0 0 36px rgba(99,102,241,0.45)' }}
          >
            <Zap className="h-8 w-8" style={{ color: '#818CF8' }} aria-hidden="true" />
          </div>

          <h2 className="relative text-[40px] sm:text-[54px] font-black tracking-[-0.055em] leading-[1.02] mb-4"
            style={{ color: '#ffffff' }}>
            Start capturing leads{' '}
            <span style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              today.
            </span>
          </h2>
          <p className="relative text-[17px] leading-relaxed mb-10 max-w-sm mx-auto"
            style={{ color: 'rgba(255,255,255,0.55)' }}>
            Set up in under 5 minutes. No developer needed.
          </p>

          <div className="relative flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2.5 h-12 px-9 rounded-xl text-[15px] font-bold transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #D4A843 0%, #E8C56B 50%, #C9A227 100%)', boxShadow: '0 6px 32px rgba(212,168,67,0.55)', color: '#0A0800' }}
            >
              Create free account
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 h-12 px-8 rounded-xl text-[14px] font-medium transition-all duration-150"
              style={{ border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.70)' }}
            >
              Sign in
            </Link>
          </div>
          <p className="relative mt-5 text-[12px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
            No setup fees · Works on any site · Free plan included
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
          ══════════════════════════════════════ */}
      <footer
        className="relative z-10 px-6 py-14"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-12">

            {/* Brand */}
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-[8px]"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)', boxShadow: '0 4px 14px rgba(99,102,241,0.45)' }}
                >
                  <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} aria-hidden="true" />
                </div>
                <span className="text-[14px] font-bold tracking-[-0.02em]" style={{ color: 'var(--fg-primary)' }}>QuoteFlow</span>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--fg-tertiary)' }}>
                AI-powered quote generation for service businesses. Embed, capture, close.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-14">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--fg-tertiary)' }}>
                  Product
                </p>
                <ul className="space-y-2.5">
                  {[
                    { href: '#features',     label: 'Features' },
                    { href: '#how-it-works', label: 'How it works' },
                    { href: '#pricing',      label: 'Pricing' },
                  ].map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        className="text-[13px] transition-colors duration-150"
                        style={{ color: 'var(--fg-secondary)' }}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--fg-tertiary)' }}>
                  Account
                </p>
                <ul className="space-y-2.5">
                  {[
                    { href: '/login',  label: 'Sign in' },
                    { href: '/signup', label: 'Sign up' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-[13px] transition-colors duration-150"
                        style={{ color: 'var(--fg-secondary)' }}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <p className="text-[12px]" style={{ color: 'var(--fg-disabled)' }}>
              © {new Date().getFullYear()} QuoteFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.8)' }}
                aria-hidden="true"
              />
              <span className="text-[12px]" style={{ color: 'var(--fg-disabled)' }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
