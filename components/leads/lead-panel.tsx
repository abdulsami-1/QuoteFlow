'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Calendar, Layers, DollarSign, Sparkles, MessageSquare, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

type LeadStatus = 'NEW' | 'CONTACTED' | 'CLOSED' | 'ARCHIVED'

interface TranscriptEntry {
  question: string
  answer: string
}

interface LeadDetail {
  id: string
  prospectName: string
  prospectEmail: string
  quoteMin: number
  quoteMax: number
  urgencyFlag: 'HIGH' | 'LOW'
  status: LeadStatus
  aiSummary: string
  emailSent: boolean
  intakeTranscript: TranscriptEntry[] | Record<string, string>
  createdAt: string
  service: { name: string }
}

const statusVariant: Record<LeadStatus, 'new' | 'contacted' | 'closed' | 'archived'> = {
  NEW: 'new',
  CONTACTED: 'contacted',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
}

interface LeadPanelProps {
  leadId: string | null
  onClose: () => void
  onStatusChange: (leadId: string, status: LeadStatus) => void
}

export function LeadPanel({ leadId, onClose, onStatusChange }: LeadPanelProps) {
  const [lead, setLead] = useState<LeadDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!leadId) {
      setLead(null)
      return
    }
    setLoading(true)
    setLead(null)
    fetch(`/api/leads/${leadId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setLead(json.data)
      })
      .catch(() => toast.error('Failed to load lead'))
      .finally(() => setLoading(false))
  }, [leadId])

  async function updateStatus(status: LeadStatus) {
    if (!lead) return
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed')
      setLead((prev) => prev ? { ...prev, status } : prev)
      onStatusChange(lead.id, status)
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const transcript = lead
    ? Array.isArray(lead.intakeTranscript)
      ? lead.intakeTranscript
      : Object.entries(lead.intakeTranscript as Record<string, string>).map(([question, answer]) => ({ question, answer }))
    : []

  return (
    <AnimatePresence>
      {leadId && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[480px] flex flex-col overflow-hidden"
            style={{
              background: 'var(--panel-bg)',
              borderLeft: '1px solid var(--panel-border)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.4)',
            }}
            aria-label="Lead detail panel"
          >
            {/* Top accent */}
            <div
              className="absolute top-0 inset-x-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(167,139,250,0.4), rgba(212,168,67,0.3), transparent)' }}
              aria-hidden="true"
            />

            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderBottom: '1px solid var(--surface-inset-border)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
                >
                  <Sparkles className="h-3 w-3" style={{ color: '#818CF8' }} aria-hidden="true" />
                </div>
                <span className="text-[13px] font-semibold text-fg-primary">Lead Details</span>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-fg-disabled hover:text-fg-primary hover:bg-elevated transition-all duration-150 cursor-pointer"
                aria-label="Close panel"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {loading ? (
                <PanelSkeleton />
              ) : lead ? (
                <>
                  {/* Email failure banner */}
                  {!lead.emailSent && (
                    <div
                      className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-warning"
                      style={{
                        background: 'var(--warning-subtle)',
                        border: '1px solid rgba(217,119,6,0.25)',
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="text-[12px] leading-relaxed">
                        Owner notification email was not delivered. Check your SMTP configuration in Settings.
                      </p>
                    </div>
                  )}

                  {/* Identity */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {/* Avatar */}
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-bold"
                        style={{
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(167,139,250,0.15))',
                          border: '1.5px solid rgba(99,102,241,0.30)',
                          color: '#A78BFA',
                        }}
                      >
                        {lead.prospectName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[16px] font-bold text-fg-primary tracking-[-0.025em] leading-tight">
                          {lead.prospectName}
                        </p>
                        <p className="text-[12px] text-fg-tertiary mt-0.5 flex items-center gap-1.5">
                          <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
                          {lead.prospectEmail}
                        </p>
                      </div>
                    </div>
                    <Badge variant={lead.urgencyFlag === 'HIGH' ? 'high-urgency' : 'low-urgency'}>
                      {lead.urgencyFlag === 'HIGH' && <AlertTriangle className="h-2.5 w-2.5 mr-1" aria-hidden="true" />}
                      {lead.urgencyFlag}
                    </Badge>
                  </div>

                  {/* Meta row */}
                  <div
                    className="grid grid-cols-2 gap-3 rounded-xl p-4"
                    style={{ background: 'var(--surface-inset)', border: '1px solid var(--surface-inset-border)' }}
                  >
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-fg-tertiary mb-1 flex items-center gap-1">
                        <Layers className="h-2.5 w-2.5" aria-hidden="true" /> Service
                      </p>
                      <p className="text-[13px] font-medium text-fg-secondary">{lead.service.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-fg-tertiary mb-1 flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" aria-hidden="true" /> Submitted
                      </p>
                      <p className="text-[13px] font-medium text-fg-secondary">{formatDate(lead.createdAt)}</p>
                    </div>
                  </div>

                  {/* Quote range */}
                  <div
                    className="relative rounded-xl p-4 overflow-hidden text-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(167,139,250,0.06) 100%)',
                      border: '1px solid rgba(99,102,241,0.20)',
                    }}
                  >
                    <div
                      className="absolute top-0 inset-x-0 h-px"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }}
                      aria-hidden="true"
                    />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-fg-tertiary mb-1.5 flex items-center justify-center gap-1">
                      <DollarSign className="h-2.5 w-2.5" aria-hidden="true" /> Estimated Range
                    </p>
                    <p
                      className="text-[28px] font-black tracking-[-0.04em] tabular-nums"
                      style={{
                        background: 'linear-gradient(135deg, #6366F1, #818CF8, #A78BFA)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {formatCurrency(lead.quoteMin)} – {formatCurrency(lead.quoteMax)}
                    </p>
                  </div>

                  {/* Status */}
                  <div
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: 'var(--surface-inset)', border: '1px solid var(--surface-inset-border)' }}
                  >
                    <span className="text-[12px] font-semibold text-fg-tertiary uppercase tracking-wider">Status</span>
                    <Select key={lead.status} value={lead.status} onValueChange={(v) => updateStatus(v as LeadStatus)}>
                      <SelectTrigger className="h-7 w-auto border-0 bg-transparent px-0 gap-1.5 focus:ring-0 focus:ring-offset-0 text-[12px]">
                        <Badge variant={statusVariant[lead.status]}>
                          {lead.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="CONTACTED">Contacted</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* AI Summary */}
                  {lead.aiSummary && (
                    <div
                      className="rounded-xl p-4"
                      style={{ background: 'var(--surface-inset)', border: '1px solid var(--surface-inset-border)' }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-fg-tertiary mb-3 flex items-center gap-1.5">
                        <Sparkles className="h-2.5 w-2.5" style={{ color: '#D4A843' }} aria-hidden="true" />
                        AI Summary
                      </p>
                      <p className="text-[13px] text-fg-secondary leading-relaxed">{lead.aiSummary}</p>
                    </div>
                  )}

                  {/* Transcript */}
                  {transcript.length > 0 && (
                    <div
                      className="rounded-xl p-4"
                      style={{ background: 'var(--surface-inset)', border: '1px solid var(--surface-inset-border)' }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-fg-tertiary mb-4 flex items-center gap-1.5">
                        <MessageSquare className="h-2.5 w-2.5" aria-hidden="true" />
                        Intake Responses
                      </p>
                      <div className="space-y-4">
                        {transcript.map((entry, i) => (
                          <div
                            key={i}
                            className={i > 0 ? 'border-t pt-4' : ''}
                            style={i > 0 ? { borderColor: 'var(--surface-inset-border)' } : undefined}
                          >
                            <p className="text-[11px] font-semibold text-fg-tertiary mb-1.5">{entry.question}</p>
                            <p className="text-[13px] text-fg-secondary leading-relaxed">{entry.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function PanelSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3.5">
        <Skeleton className="h-11 w-11 rounded-full shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  )
}
