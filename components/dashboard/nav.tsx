'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/services', label: 'Services' },
  { href: '/dashboard/stats', label: 'Stats' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-3 text-fg-secondary hover:text-fg-primary"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border bg-surface overflow-hidden"
          >
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block px-3 py-2 rounded-md text-sm font-medium',
                    pathname.startsWith(item.href)
                      ? 'bg-brand-subtle text-brand'
                      : 'text-fg-secondary hover:bg-elevated hover:text-fg-primary'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
