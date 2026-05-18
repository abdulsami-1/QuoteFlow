import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'
import { leadStatusSchema } from '@/lib/validations'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req)
    const { id } = await params

    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        businessConfig: { select: { userId: true } },
        service: { include: { pricingRules: true } },
      },
    })
    if (!lead) {
      return Response.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }
    if (lead.businessConfig.userId !== session.userId) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { businessConfig: _omit, ...leadData } = lead
    return Response.json({ success: true, data: leadData })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('GET /api/leads/[id] error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req)
    const { id } = await params
    const body = await req.json()
    const parsed = leadStatusSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 422 }
      )
    }

    const lead = await db.lead.findUnique({
      where: { id },
      include: { businessConfig: true },
    })
    if (!lead) {
      return Response.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }
    if (lead.businessConfig.userId !== session.userId) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const updated = await db.lead.update({
      where: { id },
      data: { status: parsed.data.status },
    })

    await db.notification.create({
      data: {
        businessConfigId: lead.businessConfigId,
        message: `Lead "${lead.prospectName}" status changed to ${parsed.data.status}.`,
        type: 'status',
      },
    })

    return Response.json({ success: true, data: updated })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('PUT /api/leads/[id] error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
