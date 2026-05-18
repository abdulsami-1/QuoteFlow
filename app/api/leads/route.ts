import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'
import { createLeadSchema } from '@/lib/validations'

export async function GET(req: Request) {
  try {
    const session = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as string | null
    const serviceId = searchParams.get('serviceId')
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const skip = (page - 1) * limit

    const config = await db.businessConfig.findUnique({
      where: { userId: session.userId },
    })
    if (!config) {
      return Response.json({ success: true, data: { leads: [], total: 0, page, limit } })
    }

    const where = {
      businessConfigId: config.id,
      ...(status ? { status: status as 'NEW' | 'CONTACTED' | 'CLOSED' | 'ARCHIVED' } : {}),
      ...(serviceId ? { serviceId } : {}),
    }

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        include: { service: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.lead.count({ where }),
    ])

    return Response.json({ success: true, data: { leads, total, page, limit } })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('GET /api/leads error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth(req)
    const body = await req.json()
    const parsed = createLeadSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.errors[0].message,
          details: parsed.error.errors.map((e) => ({ path: e.path.map(String), message: e.message })),
        },
        { status: 422 }
      )
    }

    const config = await db.businessConfig.findUnique({ where: { userId: session.userId } })
    if (!config) {
      return Response.json({ success: false, error: 'Business config not found' }, { status: 404 })
    }

    const service = await db.service.findUnique({ where: { id: parsed.data.serviceId } })
    if (!service || service.businessConfigId !== config.id) {
      return Response.json({ success: false, error: 'Service not found' }, { status: 404 })
    }

    const allowDuplicate = req.headers.get('x-allow-duplicate') === '1'
    if (!allowDuplicate) {
      const existing = await db.lead.findFirst({
        where: { businessConfigId: config.id, prospectEmail: parsed.data.prospectEmail },
        include: { service: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      })
      if (existing) {
        return Response.json(
          { success: false, error: 'Duplicate lead', existingLead: existing },
          { status: 409 }
        )
      }
    }

    const lead = await db.lead.create({
      data: {
        businessConfigId: config.id,
        serviceId: parsed.data.serviceId,
        prospectName: parsed.data.prospectName,
        prospectEmail: parsed.data.prospectEmail,
        quoteMin: parsed.data.quoteMin,
        quoteMax: parsed.data.quoteMax,
        urgencyFlag: parsed.data.urgencyFlag,
        status: parsed.data.status,
        aiSummary: parsed.data.aiSummary ?? '',
        intakeTranscript: [],
        emailSent: true,
      },
      include: { service: { select: { id: true, name: true } } },
    })

    return Response.json({ success: true, data: lead }, { status: 201 })
  } catch (err) {
    if (err instanceof Response) return err
    console.error('POST /api/leads error:', JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2))
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
