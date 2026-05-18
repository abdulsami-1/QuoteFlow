import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(req: Request) {
  try {
    const session = await requireAuth(req)

    const config = await db.businessConfig.findUnique({
      where: { userId: session.userId },
    })
    if (!config) {
      return Response.json({
        success: true,
        data: {
          totalLeads: 0,
          leadsThisWeek: 0,
          avgQuoteValue: 0,
          conversionRate: 0,
          leadsPerDay: [],
          statusDistribution: [],
        },
      })
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [allLeads, leadsThisWeekCount, leadsLast30Days] = await Promise.all([
      db.lead.findMany({
        where: { businessConfigId: config.id },
        select: { quoteMin: true, quoteMax: true, status: true },
      }),
      db.lead.count({
        where: {
          businessConfigId: config.id,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      db.lead.findMany({
        where: {
          businessConfigId: config.id,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    const totalLeads = allLeads.length
    const avgQuoteValue =
      totalLeads > 0
        ? Math.round(
            allLeads.reduce((sum, l) => sum + (l.quoteMin + l.quoteMax) / 2, 0) / totalLeads
          )
        : 0

    const closedCount = allLeads.filter((l) => l.status === 'CLOSED').length
    const conversionRate = totalLeads > 0 ? Math.round((closedCount / totalLeads) * 100) : 0

    // Build leadsPerDay for last 30 days
    const dayMap = new Map<string, number>()
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      dayMap.set(key, 0)
    }
    for (const lead of leadsLast30Days) {
      const key = lead.createdAt.toISOString().slice(0, 10)
      dayMap.set(key, (dayMap.get(key) ?? 0) + 1)
    }
    const leadsPerDay = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }))

    // Status distribution
    const statusMap = new Map<string, number>()
    for (const lead of allLeads) {
      statusMap.set(lead.status, (statusMap.get(lead.status) ?? 0) + 1)
    }
    const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }))

    return Response.json({
      success: true,
      data: {
        totalLeads,
        leadsThisWeek: leadsThisWeekCount,
        avgQuoteValue,
        conversionRate,
        leadsPerDay,
        statusDistribution,
      },
    })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('GET /api/stats error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
