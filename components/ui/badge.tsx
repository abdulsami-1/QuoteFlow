import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-brand-subtle text-brand ring-1 ring-inset ring-brand/25',
        secondary:   'bg-elevated text-fg-secondary ring-1 ring-inset ring-border-subtle',
        destructive: 'bg-danger-subtle text-danger ring-1 ring-inset ring-danger/20',
        outline:     'text-fg-secondary ring-1 ring-inset ring-border-subtle',
        'high-urgency': 'bg-danger-subtle text-danger ring-1 ring-inset ring-danger/20',
        'low-urgency':  'bg-elevated text-fg-tertiary ring-1 ring-inset ring-border-subtle',
        success:   'bg-success-subtle text-success ring-1 ring-inset ring-success/20',
        warning:   'bg-warning-subtle text-warning ring-1 ring-inset ring-warning/20',
        new:       'bg-brand-subtle text-brand ring-1 ring-inset ring-brand/20',
        contacted: 'bg-warning-subtle text-warning ring-1 ring-inset ring-warning/20',
        closed:    'bg-success-subtle text-success ring-1 ring-inset ring-success/20',
        archived:  'bg-elevated text-fg-tertiary ring-1 ring-inset ring-border-subtle',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
