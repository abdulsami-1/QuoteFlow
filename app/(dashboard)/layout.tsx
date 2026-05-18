import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/session'
import { Sidebar } from '@/components/dashboard/sidebar'
import { CommandPalette } from '@/components/dashboard/command-palette'
import { DashboardTopBar } from '@/components/dashboard/top-bar'
import { KeyboardShortcuts } from '@/components/dashboard/keyboard-shortcuts'

const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  starter: 50,
  pro: 200,
  agency: -1,
}

async function getSessionData() {
  const cookieStore = await cookies()
  const token = cookieStore.get('qf_session')?.value
  if (!token) return null
  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionData()
  if (!session) redirect('/login')

  const [user, business, subscription] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { name: true, email: true } }),
    db.businessConfig.findUnique({ where: { userId: session.userId }, select: { name: true, id: true } }),
    db.subscription.findUnique({ where: { userId: session.userId }, select: { plan: true } }),
  ])

  const plan = subscription?.plan ?? 'free'
  const leadsLimit = PLAN_LIMITS[plan] ?? 5

  let leadsUsed = 0
  if (business && leadsLimit > 0) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    leadsUsed = await db.lead.count({
      where: { businessConfigId: business.id, createdAt: { gte: startOfMonth } },
    })
  }

  const usage = leadsLimit > 0
    ? { plan, leadsUsed, leadsLimit }
    : null

  return (
    <div className="min-h-screen bg-base">
      <Sidebar
        businessName={business?.name}
        userEmail={user?.email ?? session.email}
        userName={user?.name ?? undefined}
        usage={usage}
      />
      <DashboardTopBar
        userName={user?.name ?? undefined}
        userEmail={user?.email ?? session.email}
        businessName={business?.name}
      />
      <main className="dashboard-main min-h-screen">
        <div className="px-6 pb-8">{children}</div>
      </main>
      <CommandPalette />
      <KeyboardShortcuts />
    </div>
  )
}
