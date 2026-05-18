'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/providers'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--fg-disabled)',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-secondary)'
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-disabled)'
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)'
      }}
    >
      {theme === 'dark' ? (
        <Sun className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Moon className="h-3.5 w-3.5" aria-hidden="true" />
      )}
    </button>
  )
}
