import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export const metadata = {
  title: 'Sign in — QuoteFlow',
}

export default function LoginPage() {
  return (
    <div
      className="relative rounded-2xl px-7 py-8 overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid transparent',
        backgroundClip: 'padding-box',
      }}
    >
      {/* Iridescent border */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          border: '1px solid transparent',
          background: `
            linear-gradient(var(--bg-surface), var(--bg-surface)) padding-box,
            linear-gradient(135deg, rgba(99,102,241,0.45), rgba(167,139,250,0.25), rgba(212,168,67,0.20)) border-box
          `,
        }}
        aria-hidden="true"
      />

      {/* Subtle inner top glow */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-px rounded-t-2xl"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(167,139,250,0.4), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="relative">
        <div className="mb-7">
          <h1 className="text-[21px] font-bold text-fg-primary tracking-[-0.035em]">
            Welcome back
          </h1>
          <p className="text-[13px] text-fg-secondary mt-1.5">
            Sign in to your QuoteFlow account
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-[13px] text-fg-tertiary mt-6">
          No account?{' '}
          <Link
            href="/signup"
            className="font-semibold transition-colors duration-150"
            style={{ color: 'var(--brand-light)' }}
          >
            Sign up free
          </Link>
        </p>

      </div>
    </div>
  )
}
