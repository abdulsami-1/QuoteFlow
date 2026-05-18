'use client'

import { Search, Sparkles, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/providers'
import { useCommandStore } from '@/lib/stores/command-store'
import { NotificationBell } from '@/components/dashboard/notification-bell'

interface TopBarProps {
  userName?: string
  userEmail?: string
  businessName?: string
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardTopBar({ userName, userEmail, businessName }: TopBarProps) {
  const { theme, setTheme } = useTheme()
  const { setOpen: openCommand } = useCommandStore()

  const initials = (userName ?? userEmail ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const greeting = getGreeting()
  const firstName = userName?.split(' ')[0] ?? userEmail?.split('@')[0] ?? 'there'

  return (
    <header
      className="hidden lg:flex items-center justify-between px-6 h-14 fixed top-0 right-0 z-20"
      style={{
        left: '228px',
        background: 'var(--topbar-bg)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        borderBottom: '1px solid var(--topbar-border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}
    >
      {/* Left: greeting */}
      <div className="flex items-center gap-2">
        <Sparkles
          className="h-3.5 w-3.5 shrink-0"
          style={{ color: '#D4A843' }}
          aria-hidden="true"
        />
        <span className="text-[13px] text-fg-tertiary">
          {greeting},{' '}
          <span className="text-fg-secondary font-semibold">{firstName}</span>
        </span>
        {businessName && (
          <>
            <span className="text-fg-disabled mx-1">·</span>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-md"
              style={{
                background: 'rgba(99,102,241,0.10)',
                border: '1px solid rgba(99,102,241,0.18)',
                color: '#818CF8',
              }}
            >
              {businessName}
            </span>
          </>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Search hint */}
        <button
          onClick={() => openCommand(true)}
          className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg text-[12px] text-fg-tertiary transition-all duration-150 hover:text-fg-secondary cursor-pointer"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
          }}
          aria-label="Search (⌘K)"
        >
          <Search className="h-3 w-3" aria-hidden="true" />
          <span>Search</span>
          <kbd
            className="ml-1 text-[10px] px-1 rounded"
            style={{
              background: 'var(--bg-elevated2)',
              color: 'var(--fg-tertiary)',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-disabled hover:text-fg-secondary hover:bg-elevated transition-all duration-150 cursor-pointer"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Moon className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>

        {/* Notification bell */}
        <NotificationBell />

        {/* Avatar */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold tracking-wide cursor-default select-none"
          style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 60%, #A78BFA 100%)',
            boxShadow: '0 0 0 2px rgba(99,102,241,0.25), 0 2px 8px rgba(99,102,241,0.35)',
            color: 'white',
          }}
          aria-hidden="true"
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
