import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/session'
import { ServiceBuilder } from '@/components/services/service-builder'
import { Layers, Plus } from 'lucide-react'

export const metadata = { title: 'Services — QuoteFlow' }

async function getServices(userId: string) {
  const config = await db.businessConfig.findUnique({ where: { userId } })
  if (!config) return []
  return db.service.findMany({
    where: { businessConfigId: config.id },
    include: { pricingRules: true },
    orderBy: { order: 'asc' },
  })
}

export default async function ServicesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('qf_session')?.value ?? ''
  const session = await verifyToken(token)
  const services = await getServices(session.userId)

  const serialized = services.map((s) => ({
    ...s,
    questions: s.questions as string[],
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }))

  return (
    <div>
      {/* ─── Page header ────────────────────────────────────── */}
      <div className="mb-7 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl mt-0.5"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(129,140,248,0.12))',
              border: '1px solid rgba(99,102,241,0.28)',
              boxShadow: '0 4px 16px rgba(99,102,241,0.18)',
            }}
          >
            <Layers className="h-5 w-5" style={{ color: '#818CF8' }} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-[26px] font-black tracking-[-0.04em] leading-none text-gradient-heading">
              Services
            </h1>
            <p className="text-[13px] text-fg-tertiary mt-1.5">
              Configure your service offerings and pricing tiers
            </p>
          </div>
        </div>

        {/* Service count badge */}
        {services.length > 0 && (
          <div
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(129,140,248,0.08))',
              border: '1px solid rgba(99,102,241,0.22)',
              color: '#818CF8',
            }}
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            {services.length} service{services.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <ServiceBuilder initialServices={serialized} />
    </div>
  )
}
