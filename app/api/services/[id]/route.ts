import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'
import { serviceSchema } from '@/lib/validations'

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
    return Response.json({ success: true, data: service })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('GET /api/services/[id] error:', err)
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
    const parsed = serviceSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 422 }
      )
    }

    const service = await db.service.findUnique({
      where: { id },
      include: { businessConfig: true },
    })
    if (!service) {
      return Response.json({ success: false, error: 'Service not found' }, { status: 404 })
    }
    if (service.businessConfig.userId !== session.userId) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const updated = await db.service.update({
      where: { id },
      data: {
        name: parsed.data.name,
        questions: parsed.data.questions,
        isActive: parsed.data.isActive ?? service.isActive,
        order: parsed.data.order ?? service.order,
      },
      include: { pricingRules: true },
    })

    return Response.json({ success: true, data: updated })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('PUT /api/services/[id] error:', err)
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

    const service = await db.service.findUnique({
      where: { id },
      include: { businessConfig: true },
    })
    if (!service) {
      return Response.json({ success: false, error: 'Service not found' }, { status: 404 })
    }
    if (service.businessConfig.userId !== session.userId) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    await db.service.delete({ where: { id } })
    return Response.json({ success: true, data: null })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('DELETE /api/services/[id] error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
