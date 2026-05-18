import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/session'
import { LeadDetail } from '@/components/leads/lead-detail'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export const metadata = { title: 'Lead Detail — QuoteFlow' }

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('qf_session')?.value ?? ''
  const session = await verifyToken(token)

  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      businessConfig: true,
      service: { include: { pricingRules: true } },
    },
  })

  if (!lead || lead.businessConfig.userId !== session.userId) notFound()

  const serialized = {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    intakeTranscript: lead.intakeTranscript as { question: string; answer: string }[],
  }

  return (
    <div>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="gap-1 text-fg-tertiary hover:text-fg-primary -ml-2 h-7 text-[12px]">
          <Link href="/dashboard/leads">
            <ChevronLeft className="h-3.5 w-3.5" /> Leads
          </Link>
        </Button>
      </div>
      <LeadDetail lead={serialized} />
    </div>
  )
}
