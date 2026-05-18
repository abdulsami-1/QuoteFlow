'use client'

import { Toaster as Sonner } from 'sonner'
import { useTheme } from '@/components/providers'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-surface group-[.toaster]:text-fg-primary group-[.toaster]:border group-[.toaster]:border-border-default group-[.toaster]:shadow-[var(--shadow-md)]',
          description: 'group-[.toast]:text-fg-tertiary',
          actionButton:
            'group-[.toast]:bg-brand group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-elevated group-[.toast]:text-fg-secondary',
          error:
            'group-[.toaster]:bg-danger-subtle group-[.toaster]:border-danger/30 group-[.toaster]:text-danger',
          success:
            'group-[.toaster]:bg-success-subtle group-[.toaster]:border-success/30 group-[.toaster]:text-success',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
