'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Mail, Calendar, Layers, DollarSign, Sparkles, MessageSquare, AlertTriangle,
} from 'lucide-react'

type LeadStatus = 'NEW' | 'CONTACTED' | 'CLOSED' | 'ARCHIVED'

interface TranscriptEntry {
  question: string
  answer: string
}

interface Lead {
  id: string
  prospectName: string
  prospectEmail: string
  quoteMin: number
  quoteMax: number
  urgencyFlag: 'HIGH' | 'LOW'
  status: LeadStatus
  aiSummary: string
  intakeTranscript: TranscriptEntry[]
  createdAt: string
  updatedAt: string
  service: { name: string }
}

const statusVariant: Record<LeadStatus, 'new' | 'contacted' | 'closed' | 'archived'> = {
  NEW: 'new',
  CONTACTED: 'contacted',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.24, ease: 'easeOut' },
  }),
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {children}
    </div>
  )
}

function SectionLabel({ icon: Icon, label, iconColor = '#818CF8' }: { icon: React.ElementType; label: string; iconColor?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      <Icon className="h-2.5 w-2.5" style={{ color: iconColor }} aria-hidden="true" />
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-tertiary)' }}>
        {label}
      </p>
    </div>
  )
}

export function LeadDetail({ lead: initialLead }: { lead: Lead }) {
  const [lead, setLead] = useState(initialLead)

  async function updateStatus(status: LeadStatus) {
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed')
      setLead((prev) => ({ ...prev, status }))
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const transcript = Array.isArray(lead.intakeTranscript)
    ? lead.intakeTranscript
    : Object.entries(lead.intakeTranscript as Record<string, string>).map(([question, answer]) => ({ question, answer }))

  const initials = lead.prospectName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="max-w-2xl space-y-4">
      {/* ── Hero header card ── */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <SectionCard>
          {/* Top accent */}
          <div
            className="absolute top-0 inset-x-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(167,139,250,0.5), rgba(212,168,67,0.3), transparent)' }}
            aria-hidden="true"
          />
          <div
            className="relative p-5"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.07) 0%, transparent 60%)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Identity */}
              <div className="flex items-start gap-3.5">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-bold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(167,139,250,0.15))',
                    border: '1.5px solid rgba(99,102,241,0.35)',
                    color: '#A78BFA',
                    boxShadow: '0 0 14px rgba(99,102,241,0.20)',
                  }}
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <h1 className="text-[20px] font-black tracking-[-0.03em] leading-tight text-fg-primary">
                    {lead.prospectName}
                  </h1>
                  <p className="text-[12px] text-fg-tertiary mt-0.5 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {lead.prospectEmail}
                  </p>
                </div>
              </div>

              {/* Badges & status */}
              <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                <Badge variant={lead.urgencyFlag === 'HIGH' ? 'high-urgency' : 'low-urgency'}>
                  {lead.urgencyFlag === 'HIGH' && <AlertTriangle className="h-2.5 w-2.5 mr-1" aria-hidden="true" />}
                  {lead.urgencyFlag} URGENCY
                </Badge>
                <Select value={lead.status} onValueChange={(v) => updateStatus(v as LeadStatus)}>
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
            </div>

            {/* Meta row */}
            <div
              className="grid grid-cols-2 gap-3 mt-4 rounded-xl p-3.5"
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
          </div>
        </SectionCard>
      </motion.div>

      {/* ── Quote range ── */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <div
          className="relative rounded-2xl p-5 overflow-hidden text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(167,139,250,0.07) 100%)',
            border: '1px solid rgba(99,102,241,0.22)',
            boxShadow: '0 4px 24px rgba(99,102,241,0.12)',
          }}
        >
          <div
            className="absolute top-0 inset-x-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.75), rgba(167,139,250,0.50), transparent)' }}
            aria-hidden="true"
          />
          <SectionLabel icon={DollarSign} label="Estimated Range" />
          <p
            className="text-[38px] font-black leading-none tracking-[-0.05em] tabular-nums mt-1"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 50%, #A78BFA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {formatCurrency(lead.quoteMin)} – {formatCurrency(lead.quoteMax)}
          </p>
        </div>
      </motion.div>

      {/* ── AI Summary ── */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <SectionCard>
          <div className="p-5">
            <SectionLabel icon={Sparkles} label="AI Summary" iconColor="#D4A843" />
            <p className="text-[13px] text-fg-secondary leading-relaxed">{lead.aiSummary}</p>
          </div>
        </SectionCard>
      </motion.div>

      {/* ── Intake Transcript ── */}
      {transcript.length > 0 && (
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <SectionCard>
            <div className="p-5">
              <SectionLabel icon={MessageSquare} label="Intake Responses" />
              <div className="space-y-5">
                {transcript.map((entry, i) => (
                  <div
                    key={i}
                    className={i > 0 ? 'border-t pt-5' : ''}
                    style={i > 0 ? { borderColor: 'var(--surface-inset-border)' } : undefined}
                  >
                    <p className="text-[11px] font-semibold text-fg-tertiary mb-1.5 uppercase tracking-wide">
                      {entry.question}
                    </p>
                    <p className="text-[13px] text-fg-secondary leading-relaxed">{entry.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </motion.div>
      )}
    </div>
  )
}
