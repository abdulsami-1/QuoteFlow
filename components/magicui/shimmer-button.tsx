'use client'

import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  background?: string
}

export function ShimmerButton({
  shimmerColor = 'rgba(255,255,255,0.08)',
  background,
  className,
  children,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        'group relative overflow-hidden rounded-xl transition-all active:scale-[0.98]',
        className,
      )}
      style={background ? { background } : undefined}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${shimmerColor} 50%, transparent 100%)`,
          animation: 'shimmer-sweep 2.5s ease-in-out infinite',
        }}
      />
      <span className="relative z-10 flex w-full items-center">{children}</span>
    </button>
  )
}
