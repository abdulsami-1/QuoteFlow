import { db } from '@/lib/db'
import { matchPricingRule, isValidDecisionKey } from '@/lib/pricing'
import { callGemini, sanitizeForAI } from '@/lib/gemini'
import { intakeConductorPrompt, leadSummarizerPrompt } from '@/lib/prompts'
import { sendLeadNotification } from '@/lib/email'
import { checkRateLimitWith, getClientIP, rateLimitResponseWith } from '@/lib/rate-limiter'
import { intakeSubmitSchema } from '@/lib/validations'

// CORS: wildcard required — this route is intentionally public and must be
// callable from any external website that embeds the QuoteFlow widget.
// All other routes have no CORS headers.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const PLAN_LIMITS: Record<string, number> = {
  free:    5,
  starter: 50,
  pro:     200,
  agency:  -1, // unlimited
}

interface ConversationEntry {
  question: string
  answer: string
}

interface GeminiIntakeResult {
  answers: Record<string, string>
  decisionKey: string
  urgencyFlag: 'HIGH' | 'LOW'
  prospectName: string
  prospectEmail: string
}

async function callIntakeConductor(params: {
  businessName: string
  questions: string[]
  triggerKeywords: string[]
  conversationLog: ConversationEntry[]
}): Promise<GeminiIntakeResult> {
  const prompt = intakeConductorPrompt({
    businessName: params.businessName,
    questions: params.questions,
    triggerKeywords: params.triggerKeywords,
    conversationLog: params.conversationLog,
  })

  const text = await callGemini(prompt)
  const parsed = JSON.parse(text) as GeminiIntakeResult

  if (!parsed.decisionKey || !parsed.urgencyFlag || !parsed.prospectName || !parsed.prospectEmail) {
    throw new Error('Gemini returned incomplete intake JSON')
  }
  return parsed
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ embedToken: string }> }
) {
  try {
    const { embedToken } = await params

    const ip = getClientIP(req)
    const rateLimit = checkRateLimitWith(ip, 10, 60 * 1000, 'intake-submit')
    if (!rateLimit.allowed) {
      return rateLimitResponseWith(
        rateLimit, 10,
        'Too many requests. Please try again later.',
        CORS_HEADERS
      )
    }

    const config = await db.businessConfig.findUnique({ where: { embedToken } })
    if (!config) {
      return Response.json({ success: false, error: 'Not found' }, { status: 404, headers: CORS_HEADERS })
    }

    // Plan enforcement — only honor plan for active/trialing subscriptions
    const subscription = await db.subscription.findUnique({
      where: { userId: config.userId },
      select: { plan: true, status: true },
    })
    const activeSubscription =
      subscription?.status === 'active' || subscription?.status === 'trialing'
    const plan = activeSubscription ? (subscription?.plan ?? 'free') : 'free'
    const limit = PLAN_LIMITS[plan] ?? 5

    if (limit !== -1) {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      const leadsThisMonth = await db.lead.count({
        where: { businessConfigId: config.id, createdAt: { gte: startOfMonth } },
      })
      if (leadsThisMonth >= limit) {
        return Response.json(
          { success: false, error: 'Monthly lead limit reached. Please contact the business to upgrade.' },
          { status: 429, headers: CORS_HEADERS }
        )
      }
    }

    const rawBody = await req.json()
    const parsed = intakeSubmitSchema.safeParse(rawBody)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400, headers: CORS_HEADERS }
      )
    }
    const { serviceId, conversationLog } = parsed.data

    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: { pricingRules: true },
    })
    if (!service || service.businessConfigId !== config.id || !service.isActive) {
      return Response.json({ success: false, error: 'Service not found' }, { status: 404, headers: CORS_HEADERS })
    }

    const questions = service.questions as string[]
    const triggerKeywords = service.pricingRules.map((r) => r.triggerKeyword)

    // Sanitize all user answers before sending to Gemini (prompt injection prevention)
    let sanitizedLog: ConversationEntry[]
    try {
      sanitizedLog = conversationLog.map((entry) => ({
        question: entry.question,
        answer: sanitizeForAI(entry.answer),
      }))
    } catch {
      return Response.json(
        { success: false, error: 'Invalid input detected in submission.' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    let intakeResult: GeminiIntakeResult
    let usedFallbackDecisionKey = false

    try {
      intakeResult = await callIntakeConductor({
        businessName: config.name,
        questions,
        triggerKeywords,
        conversationLog: sanitizedLog,
      })

      if (!isValidDecisionKey(intakeResult.decisionKey, service.pricingRules)) {
        console.error('[intake/submit] Invalid decisionKey from Gemini — using fallback', { decisionKey: intakeResult.decisionKey })
        usedFallbackDecisionKey = true
        intakeResult.decisionKey = triggerKeywords[0] ?? ''
      }
    } catch (err) {
      console.error('Gemini PROMPT 1 error:', err)
      intakeResult = {
        answers: Object.fromEntries(sanitizedLog.map((e) => [e.question, e.answer])),
        decisionKey: triggerKeywords[0] ?? '',
        urgencyFlag: 'HIGH',
        prospectName: sanitizedLog[0]?.answer?.split(' ').slice(0, 2).join(' ') ?? 'Unknown',
        prospectEmail: 'unknown@unknown.com',
      }
      usedFallbackDecisionKey = true
    }

    const pricing = matchPricingRule(intakeResult.decisionKey, service.pricingRules)
    const urgency = intakeResult.urgencyFlag === 'HIGH' || usedFallbackDecisionKey ? 'HIGH' : 'LOW'

    let aiSummary = 'Manual review required — AI summary unavailable.'
    try {
      const answersForSummary =
        intakeResult.answers && Object.keys(intakeResult.answers).length > 0
          ? intakeResult.answers
          : Object.fromEntries(sanitizedLog.map((e) => [e.question, e.answer]))

      aiSummary = await callGemini(
        leadSummarizerPrompt({ businessName: config.name, answers: answersForSummary })
      )
      aiSummary = aiSummary.replace(/^```[\w]*\s*/i, '').replace(/```$/i, '').trim()
    } catch (err) {
      console.error('Gemini PROMPT 2 error:', err)
    }

    const intakeTranscript = conversationLog.map((e) => ({
      question: e.question,
      answer: e.answer,
    }))

    const isReturningProspect = await db.lead.findFirst({
      where: { businessConfigId: config.id, prospectEmail: intakeResult.prospectEmail },
      select: { id: true },
    }).then((r) => r !== null)

    const lead = await db.lead.create({
      data: {
        businessConfigId: config.id,
        serviceId: service.id,
        prospectName: intakeResult.prospectName,
        prospectEmail: intakeResult.prospectEmail,
        intakeTranscript,
        aiSummary,
        quoteMin: pricing.minPrice,
        quoteMax: pricing.maxPrice,
        urgencyFlag: urgency,
        status: 'NEW',
      },
    })

    let emailSent = false
    try {
      await sendLeadNotification({
        ownerEmail: config.ownerEmail,
        prospectName: intakeResult.prospectName,
        prospectEmail: intakeResult.prospectEmail,
        serviceName: service.name,
        answers: Object.fromEntries(conversationLog.map((e) => [e.question, e.answer])),
        aiSummary,
        urgencyFlag: urgency,
        quoteMin: pricing.minPrice,
        quoteMax: pricing.maxPrice,
        leadId: lead.id,
      })
      emailSent = true
    } catch (err) {
      console.error('Email send error:', err)
    }

    await db.lead.update({ where: { id: lead.id }, data: { emailSent } })

    await db.notification.create({
      data: {
        businessConfigId: config.id,
        message: `New ${urgency === 'HIGH' ? 'high-urgency ' : ''}lead from ${intakeResult.prospectName} for ${service.name}.`,
        type: urgency === 'HIGH' ? 'urgent' : 'lead',
      },
    })

    return Response.json(
      {
        success: true,
        data: {
          quoteMin: pricing.minPrice,
          quoteMax: pricing.maxPrice,
          leadId: lead.id,
          prospectName: intakeResult.prospectName,
          isReturningProspect,
        },
      },
      { status: 201, headers: CORS_HEADERS }
    )
  } catch (err) {
    console.error('POST /api/intake/[embedToken]/submit error:', err)
    return Response.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
