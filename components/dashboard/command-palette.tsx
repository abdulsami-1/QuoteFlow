'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, LayoutDashboard, BarChart2, Settings, Zap } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { DialogTitle } from '@/components/ui/dialog'
import { useCommandStore } from '@/lib/stores/command-store'

const navLinks = [
  { href: '/dashboard/leads', label: 'Leads', icon: Users, shortcut: 'L' },
  { href: '/dashboard/services', label: 'Services', icon: LayoutDashboard, shortcut: 'S' },
  { href: '/dashboard/stats', label: 'Analytics', icon: BarChart2, shortcut: 'A' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, shortcut: ',' },
]

export function CommandPalette() {
  const { open, setOpen } = useCommandStore()
  const router = useRouter()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  function navigate(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <VisuallyHidden>
        <DialogTitle>Command Palette</DialogTitle>
      </VisuallyHidden>
      <CommandInput placeholder="Go to…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {navLinks.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.href}
                onSelect={() => navigate(item.href)}
                className="gap-3"
              >
                <Icon className="h-4 w-4 text-fg-tertiary" />
                {item.label}
                <CommandShortcut>⌘{item.shortcut}</CommandShortcut>
              </CommandItem>
            )
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="QuoteFlow">
          <CommandItem onSelect={() => navigate('/dashboard/leads')} className="gap-3">
            <Zap className="h-4 w-4 text-brand-light" />
            QuoteFlow Dashboard
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
