'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  BarChart2,
  LogOut,
  Menu,
  X,
  Zap,
  Users,
  Layers,
  ChevronRight,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard/leads',    label: 'Leads',     icon: Users,       showBadge: true },
  { href: '/dashboard/services', label: 'Services',  icon: Layers,      showBadge: false },
  { href: '/dashboard/stats',    label: 'Analytics', icon: BarChart2,   showBadge: false },
  { href: '/dashboard/billing',  label: 'Billing',   icon: CreditCard,  showBadge: false },
  { href: '/dashboard/settings', label: 'Settings',  icon: Settings,    showBadge: false },
]

interface UsageData {
  plan: string
  leadsUsed: number
  leadsLimit: number
}

interface SidebarProps {
  businessName?: string
  userEmail?: string
  userName?: string
  usage?: UsageData | null
}

export function Sidebar({ businessName, userEmail, userName, usage }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [newLeadsCount, setNewLeadsCount] = useState<number | null>(null)

  useEffect(() => {
    async function fetchNewLeads() {
      try {
        const res = await fetch('/api/leads?status=NEW&limit=1')
        if (!res.ok) return
        const json = await res.json()
        if (json.success) setNewLeadsCount(json.data.total ?? 0)
      } catch {}
    }
    fetchNewLeads()
    const id = setInterval(fetchNewLeads, 30_000)
    return () => clearInterval(id)
  }, [])

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const initials = (userName ?? userEmail ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const planLabel = usage?.plan
    ? usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1)
    : 'Free'

  const showUsage = usage && usage.leadsLimit > 0

  const navContent = (
    <nav className="flex h-full flex-col" aria-label="Main navigation">
      {/* Top gradient accent bar */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(167,139,250,0.5), rgba(212,168,67,0.3), transparent)',
        }}
        aria-hidden="true"
      />

      {/* Logo section */}
      <div className="flex items-center gap-3 px-4 py-5 relative">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-[11px] shrink-0 relative"
          style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 60%, #A78BFA 100%)',
            boxShadow: '0 0 0 1px rgba(99,102,241,0.4), 0 4px 20px rgba(99,102,241,0.55), 0 1px 4px rgba(99,102,241,0.35)',
          }}
        >
          <Zap className="h-4.5 w-4.5 text-white" strokeWidth={2.5} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-fg-primary leading-none tracking-[-0.025em]">
            QuoteFlow
          </p>
          {businessName && (
            <p className="text-[11px] text-fg-tertiary truncate mt-1 leading-none">
              {businessName}
            </p>
          )}
        </div>
        <div
          className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.20), rgba(167,139,250,0.12))',
            border: '1px solid rgba(99,102,241,0.25)',
            color: '#818CF8',
          }}
        >
          {planLabel}
        </div>
      </div>

      {/* Separator */}
      <div
        className="mx-4 h-px mb-2"
        style={{ background: 'linear-gradient(90deg, transparent, var(--border-subtle), transparent)' }}
        aria-hidden="true"
      />

      <p className="px-5 mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-fg-tertiary">
        Navigation
      </p>

      {/* Nav items */}
      <div className="flex-1 py-1 px-2 space-y-0.5" role="list">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          const badge = item.showBadge && newLeadsCount ? newLeadsCount : null

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              role="listitem"
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                isActive
                  ? 'text-brand'
                  : 'text-fg-tertiary hover:text-fg-secondary'
              )}
              style={isActive ? {
                background: 'linear-gradient(135deg, rgba(99,102,241,0.28) 0%, rgba(99,102,241,0.14) 60%, rgba(167,139,250,0.10) 100%)',
                boxShadow: 'inset 0 1px 0 var(--glass-border), 0 0 16px rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.22)',
              } : {
                border: '1px solid transparent',
              }}
            >
              {!isActive && (
                <span
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'var(--glass-bg-hover)' }}
                  aria-hidden="true"
                />
              )}

              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{
                    background: 'linear-gradient(180deg, #818CF8, #A78BFA)',
                    boxShadow: '0 0 8px rgba(129,140,248,0.8)',
                  }}
                  aria-hidden="true"
                />
              )}

              <div
                className="flex h-6 w-6 items-center justify-center rounded-md shrink-0 transition-all duration-200"
                style={isActive ? { background: 'rgba(129,140,248,0.20)' } : undefined}
              >
                <Icon
                  className={cn(
                    'h-3.75 w-3.75 transition-colors duration-150',
                    isActive ? 'text-brand' : 'text-fg-tertiary group-hover:text-fg-secondary'
                  )}
                  aria-hidden="true"
                />
              </div>

              <span className="flex-1">{item.label}</span>

              {badge !== null && (
                <span
                  className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold shrink-0"
                  style={{
                    background: 'rgba(99,102,241,0.25)',
                    border: '1px solid rgba(99,102,241,0.35)',
                    color: '#818CF8',
                  }}
                  aria-label={`${badge} new leads`}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}

              {isActive && !badge && (
                <ChevronRight className="h-3 w-3 text-brand-light/50 shrink-0" aria-hidden="true" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Usage indicator */}
      {showUsage && (
        <div className="mx-3 mb-3 px-3 py-3 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-fg-tertiary font-medium">Leads this month</span>
            <span className="text-[11px] text-fg-tertiary">
              {usage!.leadsUsed} / {usage!.leadsLimit}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-inset)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (usage!.leadsUsed / usage!.leadsLimit) * 100)}%`,
                background: usage!.leadsUsed / usage!.leadsLimit > 0.9
                  ? 'linear-gradient(90deg, #EF4444, #F87171)'
                  : 'linear-gradient(90deg, #6366F1, #818CF8)',
              }}
              aria-hidden="true"
            />
          </div>
          {usage!.leadsUsed >= usage!.leadsLimit && (
            <p className="text-[10px] text-danger mt-1.5">Limit reached — upgrade to continue.</p>
          )}
        </div>
      )}

      {/* Bottom separator */}
      <div
        className="mx-4 h-px mb-3"
        style={{ background: 'linear-gradient(90deg, transparent, var(--border-subtle), transparent)' }}
        aria-hidden="true"
      />

      {/* User footer */}
      <div className="px-3 pb-4">
        <div
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tracking-wide"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(167,139,250,0.15))',
              border: '1.5px solid rgba(99,102,241,0.35)',
              color: '#A78BFA',
              boxShadow: '0 0 12px rgba(99,102,241,0.20)',
            }}
            aria-hidden="true"
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            {userName && (
              <p className="text-[13px] font-medium text-fg-primary truncate leading-none">
                {userName}
              </p>
            )}
            {userEmail && (
              <p className="text-[11px] text-fg-tertiary truncate leading-none mt-0.5">
                {userEmail}
              </p>
            )}
          </div>

          <button
            onClick={handleSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="flex h-6 w-6 items-center justify-center rounded-lg text-fg-disabled hover:text-danger hover:bg-danger-subtle transition-all duration-150 shrink-0 cursor-pointer"
          >
            <LogOut className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex w-57 flex-col fixed inset-y-0 left-0 z-30 overflow-hidden"
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          boxShadow: '1px 0 20px rgba(0,0,0,0.3)',
        }}
        aria-label="Sidebar"
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 30% at 80% 100%, rgba(167,139,250,0.05) 0%, transparent 50%)',
          }}
        />
        {navContent}
      </aside>

      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 h-13"
        style={{
          background: 'var(--topbar-bg)',
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
          borderBottom: '1px solid var(--topbar-border)',
          boxShadow: '0 1px 20px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-[8px]"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #818CF8)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.5)',
            }}
          >
            <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} aria-hidden="true" />
          </div>
          <span className="text-[14px] font-bold text-fg-primary tracking-[-0.02em]">
            QuoteFlow
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileOpen}
          className="p-2 rounded-lg text-fg-tertiary hover:text-fg-secondary hover:bg-elevated transition-colors cursor-pointer"
        >
          {mobileOpen ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Menu className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-57 overflow-hidden"
              style={{
                background: 'var(--sidebar-bg)',
                borderRight: '1px solid var(--sidebar-border)',
              }}
              aria-label="Mobile navigation"
            >
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                  background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(99,102,241,0.08) 0%, transparent 60%)',
                }}
              />
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
