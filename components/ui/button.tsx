import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[13px] font-medium tracking-[-0.01em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-brand text-white shadow-[0_2px_10px_rgba(99,102,241,0.35),0_1px_3px_rgba(0,0,0,0.3)] hover:bg-[var(--brand-hover)] hover:shadow-[0_4px_18px_rgba(99,102,241,0.45)]',
        secondary:
          'bg-elevated text-fg-primary border border-border-default hover:bg-elevated2',
        ghost:
          'text-fg-secondary hover:bg-elevated hover:text-fg-primary',
        destructive:
          'bg-danger text-white hover:bg-[#b91c1c] shadow-sm',
        outline:
          'border border-border-default bg-transparent text-fg-primary hover:bg-elevated',
        link:
          'text-brand underline-offset-4 hover:underline hover:text-[var(--brand-hover)] p-0 h-auto',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-md px-3 text-[12px]',
        lg: 'h-10 rounded-md px-5 text-[14px]',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
