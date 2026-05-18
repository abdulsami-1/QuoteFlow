'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Copy, Check, Eye, Settings, RotateCcw, Trash2, Bell,
  Globe, AlertTriangle, Code2, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const settingsSchema = z.object({
  name: z.string().min(1).max(200),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  logoUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  ownerEmail: z.string().email(),
  notifyOnEveryLead: z.boolean().optional().default(true),
  notifyOnHighUrgency: z.boolean().optional().default(true),
  digestFrequency: z.enum(['instant', 'daily', 'weekly']).optional().default('instant'),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface BusinessConfig {
  name: string
  brandColor: string
  logoUrl?: string | null
  websiteUrl?: string | null
  ownerEmail: string
  embedToken: string
  notifyOnEveryLead: boolean
  notifyOnHighUrgency: boolean
  digestFrequency: string
}

function SectionIcon({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
      style={{
        background: `${color}22`,
        border: `1px solid ${color}40`,
      }}
    >
      {children}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-fg-primary">{label}</p>
        {description && <p className="text-[12px] text-fg-tertiary mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative shrink-0 h-6 w-11 rounded-full overflow-hidden transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        style={{
          background: checked ? 'var(--brand)' : 'var(--border-strong)',
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200"
          style={{
            transform: checked ? 'translateX(20px)' : 'translateX(0px)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          }}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [config, setConfig] = useState<BusinessConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [resettingToken, setResettingToken] = useState(false)
  const [deletingLeads, setDeletingLeads] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [embedToken, setEmbedToken] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  })

  const brandColorValue = watch('brandColor', '#6366f1')
  const notifyOnEveryLead = watch('notifyOnEveryLead', true)
  const notifyOnHighUrgency = watch('notifyOnHighUrgency', true)
  const digestFrequency = watch('digestFrequency', 'instant')

  useEffect(() => {
    fetch('/api/business')
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setConfig(json.data)
          setEmbedToken(json.data.embedToken)
          reset({
            ...json.data,
            logoUrl: json.data.logoUrl ?? '',
            websiteUrl: json.data.websiteUrl ?? '',
          })
        }
        setLoading(false)
      })
  }, [reset])

  async function onSubmit(data: SettingsFormData) {
    setSaving(true)
    try {
      const res = await fetch('/api/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setConfig(json.data)
      toast.success('Settings saved')
    } catch (err) {
      toast.error('Failed to save', { description: String(err) })
    } finally {
      setSaving(false)
    }
  }

  async function resetToken() {
    setResettingToken(true)
    try {
      const res = await fetch('/api/business/reset-token', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setEmbedToken(json.data.embedToken)
      setConfig((prev) => prev ? { ...prev, embedToken: json.data.embedToken } : prev)
      toast.success('Embed token regenerated')
    } catch (err) {
      toast.error('Failed to reset token', { description: String(err) })
    } finally {
      setResettingToken(false)
    }
  }

  async function deleteAllLeads() {
    setDeletingLeads(true)
    try {
      const res = await fetch('/api/leads/all', { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(`Deleted ${json.data.deleted} lead${json.data.deleted !== 1 ? 's' : ''}`)
      setDeleteConfirmOpen(false)
    } catch (err) {
      toast.error('Failed to delete leads', { description: String(err) })
    } finally {
      setDeletingLeads(false)
    }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const embedCode = embedToken
    ? `<script src="${origin}/embed.js" data-token="${embedToken}" defer></script>`
    : ''

  async function copyEmbed() {
    await navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard')
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="h-8 w-32 rounded-lg animate-pulse" style={{ background: 'var(--bg-elevated)' }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <SectionIcon color="#D4A843">
          <Settings className="h-4.5 w-4.5" style={{ color: '#D4A843' }} aria-hidden="true" />
        </SectionIcon>
        <div>
          <h1 className="text-[26px] font-black tracking-[-0.04em] leading-none text-gradient-heading">
            Settings
          </h1>
          <p className="text-[13px] text-fg-tertiary mt-0.5">
            Configure your business profile and widget
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Section 1: Business Profile ── */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <Globe className="h-4 w-4 text-brand" aria-hidden="true" />
              <CardTitle className="text-[15px]">Business Profile</CardTitle>
            </div>
            <CardDescription>Shown in lead notifications and your widget.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Business Name</Label>
              <Input id="name" placeholder="Artisan Web Studio" {...register('name')} />
              {errors.name && <p className="text-[11px] text-danger">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ownerEmail">Owner Email</Label>
              <Input
                id="ownerEmail"
                type="email"
                placeholder="you@example.com"
                {...register('ownerEmail')}
              />
              {errors.ownerEmail && (
                <p className="text-[11px] text-danger">{errors.ownerEmail.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="websiteUrl">Website URL (optional)</Label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://yourbusiness.com"
                {...register('websiteUrl')}
              />
              {errors.websiteUrl && (
                <p className="text-[11px] text-danger">{errors.websiteUrl.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brandColor">Brand Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="brandColorPicker"
                  className="h-10 w-14 cursor-pointer rounded border border-border-subtle bg-surface p-1"
                  value={brandColorValue?.match(/^#[0-9a-fA-F]{6}$/) ? brandColorValue : '#6366f1'}
                  onChange={(e) => setValue('brandColor', e.target.value, { shouldValidate: true })}
                />
                <Input id="brandColor" placeholder="#6366f1" {...register('brandColor')} />
              </div>
              {errors.brandColor && (
                <p className="text-[11px] text-danger">{errors.brandColor.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="logoUrl">Logo URL (optional)</Label>
              <Input id="logoUrl" type="url" placeholder="https://..." {...register('logoUrl')} />
            </div>

            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              {saving ? 'Saving…' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* ── Section 2: Notification Preferences ── */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <Bell className="h-4 w-4 text-brand" aria-hidden="true" />
              <CardTitle className="text-[15px]">Notification Preferences</CardTitle>
            </div>
            <CardDescription>Control when and how you receive email alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-xl divide-y"
              style={{ border: '1px solid var(--border-subtle)' }}
            >
              <div className="px-4">
                <Toggle
                  checked={notifyOnEveryLead ?? true}
                  onChange={(v) => setValue('notifyOnEveryLead', v)}
                  label="Email on every lead"
                  description="Send an email notification each time a new lead is submitted."
                />
              </div>
              <div className="px-4">
                <Toggle
                  checked={notifyOnHighUrgency ?? true}
                  onChange={(v) => setValue('notifyOnHighUrgency', v)}
                  label="High urgency alerts"
                  description="Get an immediate alert for leads flagged as high urgency."
                />
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-fg-primary">Digest frequency</p>
                    <p className="text-[12px] text-fg-tertiary mt-0.5">How often to receive lead digest emails.</p>
                  </div>
                  <select
                    value={digestFrequency ?? 'instant'}
                    onChange={(e) => setValue('digestFrequency', e.target.value as 'instant' | 'daily' | 'weekly')}
                    className="text-[12px] rounded-lg px-3 py-1.5 cursor-pointer"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--fg-primary)',
                    }}
                  >
                    <option value="instant">Instant</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving} variant="outline" className="mt-4 gap-2">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              {saving ? 'Saving…' : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* ── Section 3: Embed & Widget ── */}
      {embedToken && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <Code2 className="h-4 w-4 text-brand" aria-hidden="true" />
              <CardTitle className="text-[15px]">Embed & Widget</CardTitle>
            </div>
            <CardDescription>
              Paste this snippet on any page to show your quote widget.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="rounded-xl p-4"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <code className="text-xs text-brand font-mono break-all">{embedCode}</code>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={copyEmbed}>
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="h-3.5 w-3.5" /> Preview Widget
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-warning hover:text-warning"
                onClick={resetToken}
                disabled={resettingToken}
              >
                {resettingToken
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  : <RotateCcw className="h-3.5 w-3.5" />}
                Reset Token
              </Button>
            </div>

            <p className="text-[11px] text-fg-disabled">
              Resetting the token will break any existing embeds — update all instances with the new code.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Section 4: Danger Zone ── */}
      <Card
        style={{ borderColor: 'rgba(220,38,38,0.25)' }}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-danger" aria-hidden="true" />
            <CardTitle className="text-[15px] text-danger">Danger Zone</CardTitle>
          </div>
          <CardDescription>Irreversible actions. Proceed with caution.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
            style={{
              background: 'var(--danger-subtle)',
              border: '1px solid rgba(220,38,38,0.18)',
            }}
          >
            <div>
              <p className="text-[13px] font-semibold text-fg-primary">Delete all leads</p>
              <p className="text-[12px] text-fg-tertiary mt-0.5">
                Permanently remove every lead from your account. Cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Widget Preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle>Widget Preview</DialogTitle>
            <DialogDescription>
              Live preview of your intake widget at{' '}
              <span className="font-mono text-brand">/intake/{embedToken}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {previewOpen && embedToken && (
              <iframe
                src={`/intake/${embedToken}`}
                className="w-full border-0"
                style={{ height: 560 }}
                title="Widget Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-danger">Delete all leads?</DialogTitle>
            <DialogDescription>
              This will permanently delete every lead in your account. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAllLeads}
              disabled={deletingLeads}
              className="gap-2"
            >
              {deletingLeads && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              {deletingLeads ? 'Deleting…' : 'Yes, delete all'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
