import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'
import { serviceSchema } from '@/lib/validations'
import { checkRateLimitWith, getClientIP, rateLimitResponseWith } from '@/lib/rate-limiter'

export async function GET(req: Request) {
  try {
    const session = await requireAuth(req)
    const config = await db.businessConfig.findUnique({
      where: { userId: session.userId },
    })
    if (!config) {
      return Response.json({ success: true, data: [] })
    }
    const services = await db.service.findMany({
      where: { businessConfigId: config.id },
      include: { pricingRules: true },
      orderBy: { order: 'asc' },
    })
    return Response.json({ success: true, data: services })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('GET /api/services error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req)
    const rl = checkRateLimitWith(ip, 30, 60 * 1000, 'services-create')
    if (!rl.allowed) return rateLimitResponseWith(rl, 30)

    const session = await requireAuth(req)
    const body = await req.json()
    const parsed = serviceSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 422 }
      )
    }

    let config = await db.businessConfig.findUnique({
      where: { userId: session.userId },
    })
    if (!config) {
      const user = await db.user.findUnique({ where: { id: session.userId } })
      config = await db.businessConfig.create({
        data: {
          userId: session.userId,
          name: 'My Business',
          ownerEmail: session.email,
        },
      })
    }

    const service = await db.service.create({
      data: {
        businessConfigId: config.id,
        name: parsed.data.name,
        questions: parsed.data.questions,
        isActive: parsed.data.isActive ?? true,
        order: parsed.data.order ?? 0,
      },
      include: { pricingRules: true },
    })

    return Response.json({ success: true, data: service }, { status: 201 })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('POST /api/services error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
