import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(req: Request) {
  try {
    const session = await requireAuth(req)
    const config = await db.businessConfig.findUnique({ where: { userId: session.userId } })
    if (!config) {
      return Response.json({ success: true, data: { notifications: [], unreadCount: 0 } })
    }

    const notifications = await db.notification.findMany({
      where: { businessConfigId: config.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = notifications.filter((n) => !n.readAt).length

    return Response.json({
      success: true,
      data: {
        notifications: notifications.map((n) => ({
          ...n,
          createdAt: n.createdAt.toISOString(),
          readAt: n.readAt?.toISOString() ?? null,
        })),
        unreadCount,
      },
    })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('GET /api/notifications error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireAuth(req)
    const config = await db.businessConfig.findUnique({ where: { userId: session.userId } })
    if (!config) {
      return Response.json({ success: false, error: 'Business not configured' }, { status: 404 })
    }

    await db.notification.updateMany({
      where: { businessConfigId: config.id, readAt: null },
      data: { readAt: new Date() },
    })

    return Response.json({ success: true })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('PATCH /api/notifications error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
