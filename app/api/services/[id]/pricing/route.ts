import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'
import { pricingRuleSchema } from '@/lib/validations'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req)
    const { id } = await params

    const service = await db.service.findUnique({
      where: { id },
      include: { businessConfig: true, pricingRules: true },
    })
    if (!service) {
      return Response.json({ success: false, error: 'Service not found' }, { status: 404 })
    }
    if (service.businessConfig.userId !== session.userId) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    return Response.json({ success: true, data: service.pricingRules })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('GET /api/services/[id]/pricing error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req)
    const { id } = await params
    const body = await req.json()
    const parsed = pricingRuleSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 422 }
      )
    }

    const service = await db.service.findUnique({
      where: { id },
      include: { businessConfig: true, pricingRules: true },
    })
    if (!service) {
      return Response.json({ success: false, error: 'Service not found' }, { status: 404 })
    }
    if (service.businessConfig.userId !== session.userId) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    if (service.pricingRules.length >= 5) {
      return Response.json(
        { success: false, error: 'Maximum 5 pricing rules per service' },
        { status: 400 }
      )
    }

    const rule = await db.pricingRule.create({
      data: {
        serviceId: id,
        tierLabel: parsed.data.tierLabel,
        minPrice: parsed.data.minPrice,
        maxPrice: parsed.data.maxPrice,
        triggerKeyword: parsed.data.triggerKeyword,
      },
    })

    return Response.json({ success: true, data: rule }, { status: 201 })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('POST /api/services/[id]/pricing error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
