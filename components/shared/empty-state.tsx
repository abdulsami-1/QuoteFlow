import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-20 px-4 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border-subtle bg-surface text-fg-disabled">
          {icon}
        </div>
      )}
      <p className="text-[15px] font-semibold text-fg-primary">{title}</p>
      {description && (
        <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-fg-tertiary">
          {description}
        </p>
      )}
      {action && (
        <Button className="mt-6" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
