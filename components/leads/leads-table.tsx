'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Users, ArrowUpRight, AlertTriangle, Search, X, Download, Copy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, SortableHeader } from '@/components/ui/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { LeadPanel } from '@/components/leads/lead-panel'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

type LeadStatus = 'NEW' | 'CONTACTED' | 'CLOSED' | 'ARCHIVED'

interface Lead {
  id: string
  prospectName: string
  prospectEmail: string
  quoteMin: number
  quoteMax: number
  urgencyFlag: 'HIGH' | 'LOW'
  status: LeadStatus
  emailSent: boolean
  createdAt: string
  service: { id: string; name: string }
}

interface LeadsTableProps {
  leads: Lead[]
  onLeadAdded?: (lead: Lead) => void
}

const statusVariant: Record<LeadStatus, 'new' | 'contacted' | 'closed' | 'archived'> = {
  NEW: 'new',
  CONTACTED: 'contacted',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
}

const statusLabel: Record<LeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
}

const STATUS_FILTERS = ['ALL', 'NEW', 'CONTACTED', 'CLOSED', 'ARCHIVED'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

function exportCSV(leads: Lead[]) {
  const headers = ['Name', 'Email', 'Service', 'Quote Min', 'Quote Max', 'Urgency', 'Status', 'Date']
  const rows = leads.map((l) => [
    l.prospectName,
    l.prospectEmail,
    l.service.name,
    l.quoteMin,
    l.quoteMax,
    l.urgencyFlag,
    l.status,
    l.createdAt,
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function LeadsTable({ leads: initialLeads, onLeadAdded }: LeadsTableProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  const filtered = leads.filter((l) => {
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        l.prospectName.toLowerCase().includes(q) ||
        l.prospectEmail.toLowerCase().includes(q) ||
        l.service.name.toLowerCase().includes(q)
      )
    }
    return true
  })

  async function updateStatus(leadId: string, status: LeadStatus) {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)))
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const duplicateEmails = new Set(
    leads
      .map((l) => l.prospectEmail)
      .filter((email, _, arr) => arr.filter((e) => e === email).length > 1)
  )

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: 'prospectName',
      header: ({ column }) => <SortableHeader column={column}>Contact</SortableHeader>,
      cell: ({ row }) => (
        <div className="pl-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[14px] font-medium text-fg-primary">{row.original.prospectName}</p>
            {duplicateEmails.has(row.original.prospectEmail) && (
              <span title={`Returning prospect — ${row.original.prospectEmail} has multiple leads`}>
                <Copy className="h-3 w-3 text-fg-disabled shrink-0" aria-label="Returning prospect" />
              </span>
            )}
            {!row.original.emailSent && (
              <span title="Email not delivered — check SMTP settings in your dashboard">
                <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" aria-label="Email not delivered" />
              </span>
            )}
          </div>
          <p className="text-[12px] text-fg-tertiary mt-0.5">{row.original.prospectEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: 'service.name',
      id: 'service',
      header: ({ column }) => <SortableHeader column={column}>Service</SortableHeader>,
      cell: ({ row }) => (
        <span className="text-fg-secondary text-[13px]">{row.original.service.name}</span>
      ),
    },
    {
      id: 'quote',
      header: () => (
        <span className="text-[11px] font-medium uppercase tracking-wider text-fg-tertiary block text-right pr-1">
          Quote
        </span>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-[13px] text-fg-primary tabular-nums block text-right pr-1">
          {formatCurrency(row.original.quoteMin)}–{formatCurrency(row.original.quoteMax)}
        </span>
      ),
    },
    {
      accessorKey: 'urgencyFlag',
      header: ({ column }) => <SortableHeader column={column}>Urgency</SortableHeader>,
      cell: ({ row }) => (
        <Badge variant={row.original.urgencyFlag === 'HIGH' ? 'high-urgency' : 'low-urgency'}>
          {row.original.urgencyFlag}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
      cell: ({ row }) => (
        <div data-status-select onClick={(e) => e.stopPropagation()}>
          <Select
            key={row.original.status}
            value={row.original.status}
            onValueChange={(v) => updateStatus(row.original.id, v as LeadStatus)}
          >
            <SelectTrigger className="h-6 w-auto gap-1.5 border border-transparent hover:border-border-subtle bg-transparent px-0 text-[12px] focus:ring-0 focus:ring-offset-0 transition-colors duration-150">
              <Badge variant={statusVariant[row.original.status]}>
                {statusLabel[row.original.status]}
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
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <SortableHeader column={column}>Date</SortableHeader>,
      cell: ({ row }) => (
        <span className="text-fg-tertiary text-[12px] tabular-nums">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <ArrowUpRight
          className={`h-3.5 w-3.5 transition-colors duration-150 ${
            selectedLeadId === row.original.id ? 'text-brand opacity-100' : 'text-fg-disabled opacity-0 group-hover:opacity-100'
          }`}
        />
      ),
    },
  ]

  if (leads.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="No leads yet"
        description="Share your embed code to start capturing leads from your website."
      />
    )
  }

  return (
    <>
      {/* Toolbar: search + filter chips + export */}
      <div
        className="flex flex-col gap-2.5 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {/* Search row */}
        <div className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-fg-disabled shrink-0" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, service…"
            className="flex-1 bg-transparent text-[13px] text-fg-primary placeholder:text-fg-disabled outline-none"
          />
          <AnimatePresence>
            {search.length > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                onClick={() => setSearch('')}
                className="flex h-5 w-5 items-center justify-center rounded text-fg-disabled hover:text-fg-secondary transition-colors shrink-0 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>
          {/* Export CSV */}
          <button
            onClick={() => exportCSV(filtered)}
            title="Export as CSV"
            aria-label="Export leads as CSV"
            className="flex h-6 w-6 items-center justify-center rounded-md text-fg-disabled hover:text-fg-secondary transition-colors cursor-pointer shrink-0"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <Download className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => {
            const active = statusFilter === s
            const count = s === 'ALL' ? leads.length : leads.filter((l) => l.status === s).length
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(129,140,248,0.12))'
                    : 'var(--glass-bg)',
                  border: active
                    ? '1px solid rgba(99,102,241,0.30)'
                    : '1px solid var(--border-subtle)',
                  color: active ? '#818CF8' : 'var(--fg-tertiary)',
                }}
                aria-pressed={active}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                {' '}
                <span style={{ opacity: 0.7 }}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(lead) => setSelectedLeadId(lead.id === selectedLeadId ? null : lead.id)}
          activeRowId={selectedLeadId ?? undefined}
          getRowId={(lead) => lead.id}
        />
        {filtered.length === 0 && search.length > 0 && (
          <div className="py-12 text-center text-[13px] text-fg-disabled">
            No leads match &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      <LeadPanel
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onStatusChange={(leadId, status) =>
          setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)))
        }
      />
    </>
  )
}

export function LeadsTableSkeleton() {
  return (
    <div className="divide-y divide-border-subtle">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}
