'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Loader2, AlertTriangle, ExternalLink } from 'lucide-react'
import type { FieldPath } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const schema = z
  .object({
    prospectName:  z.string().min(2, 'Name must be at least 2 characters'),
    prospectEmail: z.string().email('Invalid email address'),
    serviceId:     z.string().min(1, 'Service is required'),
    quoteMin:      z.coerce.number()
      .min(0, 'Quote must be positive')
      .max(999999, 'Quote cannot exceed $999,999')
      .int('Quote must be a whole number'),
    quoteMax:      z.coerce.number()
      .min(1, 'Quote must be at least $1')
      .max(999999, 'Quote cannot exceed $999,999')
      .int('Quote must be a whole number'),
    urgencyFlag:   z.enum(['HIGH', 'LOW']),
    status:        z.enum(['NEW', 'CONTACTED', 'CLOSED', 'ARCHIVED']),
    aiSummary:     z.string().optional(),
  })
  .refine((d) => d.quoteMax > d.quoteMin, {
    message: 'Max must be greater than min',
    path: ['quoteMax'],
  })

type FormValues = z.infer<typeof schema>

interface Service { id: string; name: string }

interface DuplicateWarning {
  existingLeadId: string
  existingLeadName: string
  existingLeadEmail: string
}

interface AddLeadSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (lead: unknown) => void
}

export function AddLeadSheet({ open, onOpenChange, onSuccess }: AddLeadSheetProps) {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null)
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null)

  useEffect(() => {
    if (!open) {
      setDuplicateWarning(null)
      setPendingValues(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    fetch('/api/services')
      .then((r) => r.json())
      .then((json) => { if (json.success) setServices(json.data) })
      .catch(() => {})
  }, [open])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { urgencyFlag: 'LOW', status: 'NEW' },
  })

  async function submitLead(values: FormValues, allowDuplicate = false) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (allowDuplicate) headers['x-allow-duplicate'] = '1'

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers,
      body: JSON.stringify(values),
    })
    const json = await res.json()

    if (res.status === 409 && json.existingLead) {
      setDuplicateWarning({
        existingLeadId: json.existingLead.id,
        existingLeadName: json.existingLead.prospectName,
        existingLeadEmail: json.existingLead.prospectEmail,
      })
      setPendingValues(values)
      return
    }

    if (!res.ok || !json.success) {
      if (res.status === 422 && Array.isArray(json.details)) {
        for (const issue of json.details as { path: string[]; message: string }[]) {
          const field = issue.path[0] as FieldPath<FormValues>
          if (field) setError(field, { message: issue.message })
        }
        toast.error('Please fix the highlighted fields')
      } else {
        toast.error(json.error ?? 'Failed to create lead')
      }
      return
    }

    toast.success('Lead added successfully')
    reset()
    setDuplicateWarning(null)
    setPendingValues(null)
    onOpenChange(false)
    onSuccess(json.data)
  }

  async function onSubmit(values: FormValues) {
    await submitLead(values)
  }

  async function addAnyway() {
    if (!pendingValues) return
    await submitLead(pendingValues, true)
  }

  function viewExisting() {
    onOpenChange(false)
    router.push('/dashboard/leads')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-120 overflow-y-auto flex flex-col gap-0 p-0"
        style={{
          background: 'var(--panel-bg)',
          borderLeft: '1px solid var(--panel-border)',
        }}
      >
        <SheetHeader className="px-6 py-5 border-b border-border-subtle shrink-0">
          <SheetTitle className="text-[15px]">Add Lead Manually</SheetTitle>
          <SheetDescription className="text-[12px]">
            Create a lead without going through the intake widget.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-6 py-5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prospectName" className="text-[12px] text-fg-secondary">
              Full Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="prospectName"
              placeholder="Jane Smith"
              className="h-9 text-[13px]"
              {...register('prospectName')}
            />
            {errors.prospectName && (
              <p className="text-[11px] text-danger">{errors.prospectName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prospectEmail" className="text-[12px] text-fg-secondary">
              Email <span className="text-danger">*</span>
            </Label>
            <Input
              id="prospectEmail"
              type="email"
              placeholder="jane@example.com"
              className="h-9 text-[13px]"
              {...register('prospectEmail')}
            />
            {errors.prospectEmail && (
              <p className="text-[11px] text-danger">{errors.prospectEmail.message}</p>
            )}
          </div>

          {/* Service */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[12px] text-fg-secondary">
              Service <span className="text-danger">*</span>
            </Label>
            <Select onValueChange={(v) => setValue('serviceId', v, { shouldValidate: true })}>
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue placeholder="Select a service…" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceId && (
              <p className="text-[11px] text-danger">{errors.serviceId.message}</p>
            )}
          </div>

          {/* Quote range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quoteMin" className="text-[12px] text-fg-secondary">
                Quote Min ($) <span className="text-danger">*</span>
              </Label>
              <Input
                id="quoteMin"
                type="number"
                min={0}
                max={999999}
                step={1}
                placeholder="500"
                className="h-9 text-[13px]"
                {...register('quoteMin')}
              />
              {errors.quoteMin && (
                <p className="text-[11px] text-danger">{errors.quoteMin.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quoteMax" className="text-[12px] text-fg-secondary">
                Quote Max ($) <span className="text-danger">*</span>
              </Label>
              <Input
                id="quoteMax"
                type="number"
                min={1}
                max={999999}
                step={1}
                placeholder="1500"
                className="h-9 text-[13px]"
                {...register('quoteMax')}
              />
              {errors.quoteMax && (
                <p className="text-[11px] text-danger">{errors.quoteMax.message}</p>
              )}
            </div>
          </div>

          {/* Urgency + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] text-fg-secondary">Urgency</Label>
              <Select
                defaultValue="LOW"
                onValueChange={(v) => setValue('urgencyFlag', v as 'HIGH' | 'LOW', { shouldValidate: true })}
              >
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] text-fg-secondary">Status</Label>
              <Select
                defaultValue="NEW"
                onValueChange={(v) => setValue('status', v as FormValues['status'], { shouldValidate: true })}
              >
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
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

          {/* Internal notes */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aiSummary" className="text-[12px] text-fg-secondary">
              Internal Notes <span className="text-fg-disabled text-[11px]">(optional)</span>
            </Label>
            <Textarea
              id="aiSummary"
              rows={3}
              placeholder="Any notes about this lead…"
              className="min-h-[72px] resize-none"
              {...register('aiSummary')}
            />
          </div>

          {duplicateWarning && (
            <div
              className="rounded-xl px-4 py-3.5 flex flex-col gap-3"
              role="alert"
              style={{
                background: 'rgba(234,179,8,0.08)',
                border: '1px solid rgba(234,179,8,0.25)',
              }}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} aria-hidden="true" />
                <div>
                  <p className="text-[12px] font-semibold" style={{ color: 'var(--gold)' }}>
                    Duplicate lead detected
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-secondary)' }}>
                    <span className="font-medium">{duplicateWarning.existingLeadName}</span>
                    {' '}({duplicateWarning.existingLeadEmail}) already exists.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={viewExisting}
                  className="flex-1 h-7 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--fg-secondary)',
                  }}
                >
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  View existing
                </button>
                <button
                  type="button"
                  onClick={addAnyway}
                  disabled={isSubmitting}
                  className="flex-1 h-7 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'rgba(234,179,8,0.15)',
                    border: '1px solid rgba(234,179,8,0.30)',
                    color: 'var(--gold)',
                  }}
                >
                  {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : null}
                  Add anyway
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 text-[13px] font-medium mt-1"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" aria-hidden="true" />
            ) : (
              <Plus className="h-3.5 w-3.5 mr-2" aria-hidden="true" />
            )}
            {isSubmitting ? 'Adding…' : 'Add Lead'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
