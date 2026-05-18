import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-border-default bg-elevated px-4 py-2 text-sm text-fg-primary placeholder:text-fg-disabled transition-colors duration-150 resize-vertical',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:border-brand',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-danger/60 focus-visible:ring-danger/20 focus-visible:border-danger',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
