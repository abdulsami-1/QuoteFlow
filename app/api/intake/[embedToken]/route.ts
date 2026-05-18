import { db } from '@/lib/db'

// CORS: wildcard required — this route is intentionally public and must be
// callable from any external website that embeds the QuoteFlow widget.
// All other routes have no CORS headers.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ embedToken: string }> }
) {
  try {
    const { embedToken } = await params

    const config = await db.businessConfig.findUnique({
      where: { embedToken },
      include: {
        services: {
          where: { isActive: true },
          include: { pricingRules: true },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!config) {
      return Response.json({ success: false, error: 'Not found' }, { status: 404, headers: CORS_HEADERS })
    }

    return Response.json(
      {
        success: true,
        data: {
          businessName: config.name,
          brandColor: config.brandColor,
          services: config.services.map((s) => ({
            id: s.id,
            name: s.name,
            questions: s.questions,
            pricingRules: s.pricingRules,
          })),
        },
      },
      { headers: CORS_HEADERS }
    )
  } catch (err) {
    console.error('GET /api/intake/[embedToken] error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500, headers: CORS_HEADERS })
  }
}
