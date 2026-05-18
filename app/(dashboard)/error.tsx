'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(248,113,113,0.18), rgba(239,68,68,0.08))',
          border: '1px solid rgba(248,113,113,0.28)',
          boxShadow: '0 0 28px rgba(248,113,113,0.12)',
        }}
      >
        <AlertTriangle className="h-6 w-6 text-danger" aria-hidden="true" />
      </div>

      <h2 className="text-[20px] font-black text-fg-primary tracking-[-0.03em] mb-2">
        Something went wrong
      </h2>
      <p className="text-[13px] text-fg-tertiary mb-7 max-w-xs leading-relaxed">
        An error occurred loading this page. Your data is safe.
      </p>

      <Button
        onClick={() => reset()}
        className="gap-2"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        Try again
      </Button>
    </div>
  )
}
