'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCommandStore } from '@/lib/stores/command-store'

const GO_TARGETS: Record<string, string> = {
  l: '/dashboard/leads',
  s: '/dashboard/services',
  a: '/dashboard/stats',
  b: '/dashboard/billing',
  ',': '/dashboard/settings',
}

export function KeyboardShortcuts() {
  const router = useRouter()
  const { setOpen } = useCommandStore()
  const gPressedAt = useRef<number | null>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) ||
        (e.target as HTMLElement).isContentEditable

      if (e.metaKey || e.ctrlKey || e.altKey) return

      const rawKey = e.key
      if (!rawKey || typeof rawKey !== 'string') return

      const key = rawKey.toLowerCase()

      if (!inInput && key === '/') {
        e.preventDefault()
        setOpen(true)
        return
      }

      if (inInput) return

      if (key === 'escape') {
        setOpen(false)
        return
      }

      if (key === 'g') {
        gPressedAt.current = Date.now()
        return
      }

      if (gPressedAt.current !== null) {
        const elapsed = Date.now() - gPressedAt.current
        gPressedAt.current = null

        if (elapsed < 1000 && GO_TARGETS[key]) {
          e.preventDefault()
          router.push(GO_TARGETS[key])
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [router, setOpen])

  return null
}
