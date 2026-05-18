'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, ChevronDown, ChevronUp, Layers } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PricingRulesEditor } from './pricing-rules-editor'
import { toast } from 'sonner'
import { EmptyState } from '@/components/shared/empty-state'

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name required').max(200),
  questions: z.array(z.object({ value: z.string().min(1, 'Question required') })).min(1).max(7),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface PricingRule {
  id: string
  tierLabel: string
  minPrice: number
  maxPrice: number
  triggerKeyword: string
}

interface Service {
  id: string
  name: string
  isActive: boolean
  order: number
  questions: string[]
  pricingRules: PricingRule[]
}

interface ServiceBuilderProps {
  initialServices: Service[]
}

export function ServiceBuilder({ initialServices }: ServiceBuilderProps) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: '', questions: [{ value: '' }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' })

  async function onAddService(data: ServiceFormData) {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          questions: data.questions.map((q) => q.value),
          isActive: true,
          order: services.length,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setServices((prev) => [...prev, json.data])
      reset()
      setAddDialogOpen(false)
      toast.success('Service added')
    } catch (err) {
      toast.error('Error', { description: String(err) })
    }
  }

  async function toggleActive(service: Service) {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: service.name,
          questions: service.questions,
          isActive: !service.isActive,
          order: service.order,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, isActive: !s.isActive } : s))
      )
    } catch {
      toast.error('Failed to update service')
    }
  }

  async function moveService(id: string, direction: 'up' | 'down') {
    const idx = services.findIndex((s) => s.id === id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === services.length - 1) return

    const newServices = [...services]
    const swap = direction === 'up' ? idx - 1 : idx + 1
    ;[newServices[idx], newServices[swap]] = [newServices[swap], newServices[idx]]
    setServices(newServices)

    await Promise.all([
      fetch(`/api/services/${newServices[idx].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newServices[idx], questions: newServices[idx].questions, order: idx }),
      }),
      fetch(`/api/services/${newServices[swap].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newServices[swap], questions: newServices[swap].questions, order: swap }),
      }),
    ])
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-fg-tertiary">
          {services.length} service{services.length !== 1 ? 's' : ''}
        </p>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onAddService)} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Service Name</Label>
                <Input placeholder="Landing Page Design" {...register('name')} />
                {errors.name && <p className="text-[11px] text-danger">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Intake Questions</Label>
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder={`Question ${idx + 1}`}
                      {...register(`questions.${idx}.value`)}
                      className="flex-1"
                    />
                    {fields.length > 1 && (
                      <Button type="button" size="icon" variant="ghost" className="h-10 w-10" onClick={() => remove(idx)}>
                        <Trash2 className="h-4 w-4 text-fg-tertiary" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                ))}
                {fields.length < 7 && (
                  <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => append({ value: '' })}>
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add Question
                  </Button>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Create Service</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-8 w-8" />}
          title="No services yet"
          description="Add your first service to start capturing leads."
        />
      ) : (
        <div className="space-y-3">
          {services.map((service, idx) => {
            const isExpanded = expandedId === service.id
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.22, ease: 'easeOut' }}
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: isExpanded
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.09) 0%, var(--bg-surface) 60%)'
                    : 'var(--bg-surface)',
                  border: isExpanded
                    ? '1px solid rgba(99,102,241,0.22)'
                    : '1px solid var(--border-default)',
                  boxShadow: isExpanded ? 'var(--shadow-brand)' : 'var(--shadow-md)',
                  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                }}
              >
                {/* Top accent */}
                <div
                  className="absolute top-0 inset-x-0 h-px pointer-events-none"
                  aria-hidden="true"
                  style={{
                    background: isExpanded
                      ? 'linear-gradient(90deg, transparent, rgba(99,102,241,0.70), rgba(167,139,250,0.45), transparent)'
                      : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                  }}
                />

                {/* Service row */}
                <div className="flex items-center gap-3 px-4 py-3.5 relative z-10">
                  {/* Move buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      className="flex h-5 w-5 items-center justify-center rounded text-fg-disabled hover:text-fg-secondary hover:bg-elevated transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      onClick={() => moveService(service.id, 'up')}
                      disabled={idx === 0}
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <button
                      className="flex h-5 w-5 items-center justify-center rounded text-fg-disabled hover:text-fg-secondary hover:bg-elevated transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      onClick={() => moveService(service.id, 'down')}
                      disabled={idx === services.length - 1}
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Icon */}
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: isExpanded
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(167,139,250,0.12))'
                        : 'var(--glass-bg)',
                      border: isExpanded
                        ? '1px solid rgba(99,102,241,0.30)'
                        : '1px solid var(--border-subtle)',
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                  >
                    <Layers
                      className="h-3.5 w-3.5"
                      style={{ color: isExpanded ? '#818CF8' : 'var(--fg-tertiary)', transition: 'color 0.2s' }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-fg-primary truncate">{service.name}</p>
                    <p className="text-[11px] text-fg-tertiary mt-0.5">
                      {service.questions.length} question{service.questions.length !== 1 ? 's' : ''}{' '}
                      &middot;{' '}
                      {service.pricingRules.length} pricing rule{service.pricingRules.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Active toggle + expand */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={service.isActive}
                        onCheckedChange={() => toggleActive(service)}
                        aria-label={service.isActive ? 'Deactivate service' : 'Activate service'}
                      />
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: service.isActive ? 'var(--success)' : 'var(--fg-disabled)' }}
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-fg-tertiary hover:text-fg-secondary hover:bg-elevated transition-all duration-150 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : service.id)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <ChevronDown
                        className="h-4 w-4 transition-transform duration-200"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-4 pb-5 pt-4 space-y-5"
                        style={{ borderTop: '1px solid var(--border-subtle)' }}
                      >
                        {/* Questions */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-fg-tertiary mb-2.5">
                            Questions
                          </p>
                          <ol className="space-y-2">
                            {service.questions.map((q, qi) => (
                              <li
                                key={qi}
                                className="flex items-start gap-2.5 text-[13px] text-fg-secondary"
                              >
                                <span
                                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold mt-px"
                                  style={{
                                    background: 'rgba(99,102,241,0.12)',
                                    border: '1px solid rgba(99,102,241,0.20)',
                                    color: '#818CF8',
                                  }}
                                >
                                  {qi + 1}
                                </span>
                                {q}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Pricing rules */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-fg-tertiary mb-2.5">
                            Pricing Rules
                          </p>
                          <PricingRulesEditor
                            serviceId={service.id}
                            initialRules={service.pricingRules}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
