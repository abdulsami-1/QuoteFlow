'use client'

import type { CSSProperties } from 'react'

interface BorderBeamProps {
  size?: number
  duration?: number
  colorFrom?: string
  colorTo?: string
  borderWidth?: number
  borderRadius?: number
  className?: string
}

export function BorderBeam({
  size = 100,
  duration = 6,
  colorFrom = '#6366f1',
  colorTo = '#a5b4fc',
  borderWidth = 1,
  borderRadius = 16,
}: BorderBeamProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{
        border: `${borderWidth}px solid transparent`,
        maskImage: 'linear-gradient(white, white), linear-gradient(white, white)',
        maskClip: 'padding-box, border-box',
        maskComposite: 'exclude' as CSSProperties['maskComposite'],
        WebkitMaskImage: 'linear-gradient(white, white), linear-gradient(white, white)',
        WebkitMaskClip: 'padding-box, border-box' as string,
        WebkitMaskComposite: 'destination-out',
      }}
    >
      <span
        style={{
          position: 'absolute',
          width: size,
          height: size,
          background: `linear-gradient(to right, ${colorFrom}, ${colorTo})`,
          offsetPath: `rect(0 auto auto 0 round ${borderRadius}px)`,
          animation: `border-beam ${duration}s linear infinite`,
          offsetAnchor: '90% 50%',
        } as CSSProperties}
      />
    </div>
  )
}
