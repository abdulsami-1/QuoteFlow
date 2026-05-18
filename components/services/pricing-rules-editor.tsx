'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

const ruleSchema = z.object({
  tierLabel: z.string().min(1, 'Label required'),
  minPrice: z.number({ invalid_type_error: 'Required' }).int().positive(),
  maxPrice: z.number({ invalid_type_error: 'Required' }).int().positive(),
  triggerKeyword: z.string().min(1, 'Keyword required'),
})

type RuleFormData = z.infer<typeof ruleSchema>

interface PricingRule {
  id: string
  tierLabel: string
  minPrice: number
  maxPrice: number
  triggerKeyword: string
}

interface PricingRulesEditorProps {
  serviceId: string
  initialRules: PricingRule[]
}

export function PricingRulesEditor({ serviceId, initialRules }: PricingRulesEditorProps) {
  const [rules, setRules] = useState<PricingRule[]>(initialRules)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
  })

  async function onAdd(data: RuleFormData) {
    if (rules.length >= 5) {
      toast.error('Maximum 5 pricing rules')
      return
    }
    try {
      const res = await fetch(`/api/services/${serviceId}/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setRules((prev) => [...prev, json.data])
      reset()
      setAdding(false)
      toast.success('Pricing rule added')
    } catch (err) {
      toast.error('Error', { description: String(err) })
    }
  }

  async function onEdit(ruleId: string, data: RuleFormData) {
    try {
      const res = await fetch(`/api/pricing/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setRules((prev) => prev.map((r) => (r.id === ruleId ? json.data : r)))
      setEditingId(null)
      toast.success('Rule updated')
    } catch (err) {
      toast.error('Error', { description: String(err) })
    }
  }

  async function onDelete(ruleId: string) {
    try {
      const res = await fetch(`/api/pricing/${ruleId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setRules((prev) => prev.filter((r) => r.id !== ruleId))
      toast.success('Rule deleted')
    } catch {
      toast.error('Failed to delete rule')
    }
  }

  return (
    <div className="space-y-4">
      {rules.length === 0 && !adding && (
        <p className="text-xs text-fg-tertiary">No pricing rules yet. Add one to enable quoting.</p>
      )}

      {rules.map((rule) =>
        editingId === rule.id ? (
          <EditRuleForm
            key={rule.id}
            rule={rule}
            onSave={(data) => onEdit(rule.id, data)}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div
            key={rule.id}
            className="flex items-center justify-between rounded-md border border-border-subtle bg-base px-4 py-2 text-sm"
          >
            <div className="space-y-0.5">
              <p className="font-medium text-fg-primary">{rule.tierLabel}</p>
              <p className="text-xs text-fg-tertiary">
                {formatCurrency(rule.minPrice)} – {formatCurrency(rule.maxPrice)} ·{' '}
                <span className="font-mono text-fg-secondary">{rule.triggerKeyword}</span>
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setEditingId(rule.id)}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-danger hover:text-danger/80 hover:bg-danger-subtle"
                onClick={() => onDelete(rule.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )
      )}

      {adding ? (
        <form
          onSubmit={handleSubmit(onAdd)}
          className="rounded-md border border-border-subtle bg-base p-4 space-y-4"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Tier Label</Label>
              <Input placeholder="Basic" className="h-8 text-xs mt-1" {...register('tierLabel')} />
              {errors.tierLabel && <p className="text-[11px] text-danger mt-0.5">{errors.tierLabel.message}</p>}
            </div>
            <div>
              <Label className="text-xs">Trigger Keyword</Label>
              <Input placeholder="simple" className="h-8 text-xs mt-1 font-mono" {...register('triggerKeyword')} />
              {errors.triggerKeyword && <p className="text-[11px] text-danger mt-0.5">{errors.triggerKeyword.message}</p>}
            </div>
            <div>
              <Label className="text-xs">Min Price ($)</Label>
              <Input type="number" placeholder="400" className="h-8 text-xs mt-1" {...register('minPrice', { valueAsNumber: true })} />
              {errors.minPrice && <p className="text-[11px] text-danger mt-0.5">{errors.minPrice.message}</p>}
            </div>
            <div>
              <Label className="text-xs">Max Price ($)</Label>
              <Input type="number" placeholder="700" className="h-8 text-xs mt-1" {...register('maxPrice', { valueAsNumber: true })} />
              {errors.maxPrice && <p className="text-[11px] text-danger mt-0.5">{errors.maxPrice.message}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="h-7 text-xs">
              <Check className="h-3 w-3 mr-1" /> Add
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setAdding(false); reset() }}>
              <X className="h-3 w-3 mr-1" /> Cancel
            </Button>
          </div>
        </form>
      ) : (
        rules.length < 5 && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Rule
          </Button>
        )
      )}
    </div>
  )
}

function EditRuleForm({
  rule,
  onSave,
  onCancel,
}: {
  rule: PricingRule
  onSave: (data: RuleFormData) => void
  onCancel: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      tierLabel: rule.tierLabel,
      minPrice: rule.minPrice,
      maxPrice: rule.maxPrice,
      triggerKeyword: rule.triggerKeyword,
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      className="rounded-md border border-brand/30 bg-base p-4 space-y-4"
    >
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Tier Label</Label>
          <Input className="h-8 text-xs mt-1" {...register('tierLabel')} />
          {errors.tierLabel && <p className="text-[11px] text-danger mt-0.5">{errors.tierLabel.message}</p>}
        </div>
        <div>
          <Label className="text-xs">Trigger Keyword</Label>
          <Input className="h-8 text-xs mt-1 font-mono" {...register('triggerKeyword')} />
        </div>
        <div>
          <Label className="text-xs">Min Price ($)</Label>
          <Input type="number" className="h-8 text-xs mt-1" {...register('minPrice', { valueAsNumber: true })} />
        </div>
        <div>
          <Label className="text-xs">Max Price ($)</Label>
          <Input type="number" className="h-8 text-xs mt-1" {...register('maxPrice', { valueAsNumber: true })} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="h-7 text-xs">
          <Check className="h-3 w-3 mr-1" /> Save
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={onCancel}>
          <X className="h-3 w-3 mr-1" /> Cancel
        </Button>
      </div>
    </form>
  )
}
