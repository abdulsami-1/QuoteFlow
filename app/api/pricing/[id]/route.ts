import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'
import { pricingRuleSchema } from '@/lib/validations'

export async function PUT(
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

    const rule = await db.pricingRule.findUnique({
      where: { id },
      include: { service: { include: { businessConfig: true } } },
    })
    if (!rule) {
      return Response.json({ success: false, error: 'Pricing rule not found' }, { status: 404 })
    }
    if (rule.service.businessConfig.userId !== session.userId) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const updated = await db.pricingRule.update({
      where: { id },
      data: {
        tierLabel: parsed.data.tierLabel,
        minPrice: parsed.data.minPrice,
        maxPrice: parsed.data.maxPrice,
        triggerKeyword: parsed.data.triggerKeyword,
      },
    })

    return Response.json({ success: true, data: updated })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('PUT /api/pricing/[id] error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req)
    const { id } = await params

    const rule = await db.pricingRule.findUnique({
      where: { id },
      include: { service: { include: { businessConfig: true } } },
    })
    if (!rule) {
      return Response.json({ success: false, error: 'Pricing rule not found' }, { status: 404 })
    }
    if (rule.service.businessConfig.userId !== session.userId) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    await db.pricingRule.delete({ where: { id } })
    return Response.json({ success: true, data: null })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('DELETE /api/pricing/[id] error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
