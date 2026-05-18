'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/providers'

export function HomeThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-strong)',
        color: 'var(--fg-secondary)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.background = 'var(--glass-bg-hover)'
        el.style.color = 'var(--fg-primary)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.background = 'var(--glass-bg)'
        el.style.color = 'var(--fg-secondary)'
      }}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}
