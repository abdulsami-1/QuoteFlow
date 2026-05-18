import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'
import { businessConfigSchema } from '@/lib/validations'
import { checkRateLimitWith, getClientIP, rateLimitResponseWith } from '@/lib/rate-limiter'

export async function GET(req: Request) {
  try {
    const session = await requireAuth(req)
    const config = await db.businessConfig.findUnique({
      where: { userId: session.userId },
      include: { services: { orderBy: { order: 'asc' } } },
    })
    if (!config) {
      return Response.json({ success: true, data: null })
    }
    return Response.json({ success: true, data: config })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('GET /api/business error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const ip = getClientIP(req)
    const rl = checkRateLimitWith(ip, 30, 60 * 1000, 'business-update')
    if (!rl.allowed) return rateLimitResponseWith(rl, 30)

    const session = await requireAuth(req)
    const body = await req.json()
    const parsed = businessConfigSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 422 }
      )
    }

    const { name, brandColor, logoUrl, websiteUrl, ownerEmail, notifyOnEveryLead, notifyOnHighUrgency, digestFrequency } = parsed.data
    const config = await db.businessConfig.upsert({
      where: { userId: session.userId },
      update: {
        name,
        brandColor,
        logoUrl: logoUrl || null,
        websiteUrl: websiteUrl || null,
        ownerEmail,
        notifyOnEveryLead: notifyOnEveryLead ?? true,
        notifyOnHighUrgency: notifyOnHighUrgency ?? true,
        digestFrequency: digestFrequency ?? 'instant',
      },
      create: {
        userId: session.userId,
        name,
        brandColor,
        logoUrl: logoUrl || null,
        websiteUrl: websiteUrl || null,
        ownerEmail,
        notifyOnEveryLead: notifyOnEveryLead ?? true,
        notifyOnHighUrgency: notifyOnHighUrgency ?? true,
        digestFrequency: digestFrequency ?? 'instant',
      },
    })

    return Response.json({ success: true, data: config })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('PUT /api/business error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
