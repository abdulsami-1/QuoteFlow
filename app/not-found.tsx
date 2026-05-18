import Link from 'next/link'
import { Zap, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      {/* Cinematic ambient */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center" aria-hidden="true">
        <div
          className="h-175 w-175 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)',
            filter: 'blur(70px)',
          }}
        />
      </div>
      <div className="pointer-events-none fixed inset-0 bg-grid" aria-hidden="true" />

      <div className="relative z-10 text-center max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-[13px]"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #818CF8)',
              boxShadow: 'var(--shadow-brand-lg)',
            }}
          >
            <Zap className="h-6 w-6 text-white" strokeWidth={2.5} aria-hidden="true" />
          </div>
        </div>

        {/* 404 */}
        <p className="text-[88px] font-black leading-none tracking-[-0.07em] mb-3 text-gradient-iridescent">
          404
        </p>

        <h1 className="text-[20px] font-bold text-fg-primary tracking-[-0.03em] mb-2">
          Page not found
        </h1>
        <p className="text-[14px] text-fg-secondary leading-relaxed mb-9">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-bold text-white transition-all duration-200 hover:-translate-y-px hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #6366F1, #818CF8)',
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
