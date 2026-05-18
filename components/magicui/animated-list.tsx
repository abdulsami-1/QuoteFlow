'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface AnimatedListProps {
  children: ReactNode[]
  className?: string
  delay?: number
  duration?: number
}

export function AnimatedList({
  children,
  className,
  delay = 0.05,
  duration = 0.2,
}: AnimatedListProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * delay, duration, ease: 'easeOut' }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
