'use client'

import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NumberTickerProps {
  value: number
  prefix?: string
  suffix?: string
  decimalPlaces?: number
  duration?: number
  className?: string
}

export function NumberTicker({
  value,
  prefix = '',
  suffix = '',
  decimalPlaces = 0,
  duration = 1.2,
  className,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate(latest) {
        if (ref.current) {
          const formatted = Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)))
          ref.current.textContent = `${prefix}${formatted}${suffix}`
        }
      },
    })
    return () => controls.stop()
  }, [value, prefix, suffix, decimalPlaces, duration])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}0{suffix}
    </span>
  )
}
