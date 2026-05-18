import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  try {
    const session = await requireAuth(req)
    const config = await db.businessConfig.findUnique({ where: { userId: session.userId } })
    if (!config) {
      return Response.json({ success: false, error: 'Business not configured' }, { status: 404 })
    }

    const updated = await db.businessConfig.update({
      where: { id: config.id },
      data: { embedToken: randomUUID() },
    })

    return Response.json({ success: true, data: { embedToken: updated.embedToken } })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('POST /api/business/reset-token error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
