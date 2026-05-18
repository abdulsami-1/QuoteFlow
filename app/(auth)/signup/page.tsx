import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata = {
  title: 'Create account — QuoteFlow',
}

export default function SignupPage() {
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
            linear-gradient(135deg, rgba(212,168,67,0.40), rgba(167,139,250,0.25), rgba(99,102,241,0.30)) border-box
          `,
        }}
        aria-hidden="true"
      />

      {/* Gold-tinted top accent */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-px rounded-t-2xl"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.55), rgba(232,197,107,0.3), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="relative">
        <div className="mb-7">
          <h1 className="text-[21px] font-bold text-fg-primary tracking-[-0.035em]">
            Create your account
          </h1>
          <p className="text-[13px] text-fg-secondary mt-1.5">
            Start capturing quotes in minutes — free forever.
          </p>
        </div>

        <SignupForm />

        <p className="text-center text-[13px] text-fg-tertiary mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold transition-colors duration-150"
            style={{ color: 'var(--brand-light)' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
