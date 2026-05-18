import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'
import { checkRateLimitWith, getClientIP, rateLimitResponseWith } from '@/lib/rate-limiter'

export async function DELETE(req: Request) {
  try {
    const ip = getClientIP(req)
    const rl = checkRateLimitWith(ip, 5, 5 * 60 * 1000, 'leads-delete-all')
    if (!rl.allowed) return rateLimitResponseWith(rl, 5)

    const session = await requireAuth(req)
    const config = await db.businessConfig.findUnique({ where: { userId: session.userId } })
    if (!config) {
      return Response.json({ success: false, error: 'Business not configured' }, { status: 404 })
    }

    const { count } = await db.lead.deleteMany({ where: { businessConfigId: config.id } })

    return Response.json({ success: true, data: { deleted: count } })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('DELETE /api/leads/all error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
