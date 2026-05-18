'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, Zap, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Notification {
  id: string
  message: string
  type: string
  readAt: string | null
  createdAt: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications')
      const json = await res.json()
      if (json.success) {
        setNotifications(json.data.notifications)
        setUnreadCount(json.data.unreadCount)
      }
    } catch {
      // silent
    }
  }

  async function markAllRead() {
    if (unreadCount === 0) return
    setLoading(true)
    try {
      await fetch('/api/notifications', { method: 'PATCH' })
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })))
      setUnreadCount(0)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  function handleOpen() {
    setOpen((prev) => !prev)
    if (!open) fetchNotifications()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-fg-disabled hover:text-fg-secondary hover:bg-elevated transition-all duration-150 cursor-pointer"
        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
      >
        <Bell className="h-3.5 w-3.5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white"
            style={{ background: '#D4A843', boxShadow: '0 0 6px rgba(212,168,67,0.8)' }}
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-10 w-80 rounded-2xl overflow-hidden z-50"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <span className="text-[12px] font-semibold text-fg-primary">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loading}
                  className="flex items-center gap-1 text-[11px] text-brand hover:text-brand-light transition-colors cursor-pointer"
                >
                  <CheckCheck className="h-3 w-3" aria-hidden="true" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Zap className="h-6 w-6 text-fg-disabled" aria-hidden="true" />
                  <p className="text-[12px] text-fg-tertiary">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors"
                    style={{
                      background: !n.readAt ? 'var(--brand-muted)' : 'transparent',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5"
                      style={{
                        background: n.type === 'urgent'
                          ? 'rgba(248,113,113,0.15)'
                          : 'rgba(99,102,241,0.15)',
                        border: n.type === 'urgent'
                          ? '1px solid rgba(248,113,113,0.25)'
                          : '1px solid rgba(99,102,241,0.25)',
                      }}
                    >
                      {n.type === 'urgent'
                        ? <AlertTriangle className="h-3 w-3" style={{ color: '#F87171' }} aria-hidden="true" />
                        : <Zap className="h-3 w-3" style={{ color: '#818CF8' }} aria-hidden="true" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-fg-secondary leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-fg-disabled mt-1">{formatDate(n.createdAt)}</p>
                    </div>
                    {!n.readAt && (
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: 'var(--brand)' }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
