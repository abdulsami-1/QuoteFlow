import { Zap } from 'lucide-react'
import { AuthFadeWrapper } from '@/components/auth/auth-fade-wrapper'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-base px-4 overflow-hidden">

      {/* ─── Cinematic ambient blobs ─── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {/* Primary indigo blob */}
        <div
          className="absolute top-[-15%] left-[50%] -translate-x-1/2 h-175 w-175 rounded-full animate-blob"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.11) 0%, transparent 65%)',
            filter: 'blur(70px)',
          }}
        />
        {/* Violet blob */}
        <div
          className="absolute bottom-[5%] right-[10%] h-112.5 w-112.5 rounded-full animate-blob"
          style={{
            background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 65%)',
            filter: 'blur(90px)',
            animationDelay: '-7s',
          }}
        />
        {/* Gold accent blob */}
        <div
          className="absolute top-[35%] left-[5%] h-87.5 w-87.5 rounded-full animate-blob"
          style={{
            background: 'radial-gradient(circle, rgba(212,168,67,0.055) 0%, transparent 65%)',
            filter: 'blur(80px)',
            animationDelay: '-14s',
          }}
        />
      </div>

      {/* Subtle grid */}
      <div className="pointer-events-none fixed inset-0 bg-grid" aria-hidden="true" />

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <AuthFadeWrapper>
          {/* Brand mark */}
          <div className="flex items-center justify-center gap-3 mb-9">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[10px] shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                boxShadow: '0 6px 28px rgba(99,102,241,0.55), 0 2px 8px rgba(99,102,241,0.3)',
              }}
            >
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <span className="text-[18px] font-bold text-fg-primary tracking-[-0.035em]">
              QuoteFlow
            </span>
          </div>
          {children}
        </AuthFadeWrapper>
      </div>

      <p className="relative z-10 mt-10 text-[11px] text-fg-disabled tracking-wide">
        © {new Date().getFullYear()} QuoteFlow · All rights reserved
      </p>
    </div>
  )
}
