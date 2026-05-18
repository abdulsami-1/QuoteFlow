import { db } from '@/lib/db'
import { signupSchema } from '@/lib/validations'
import { signToken, setSessionCookie } from '@/lib/session'
import { checkRateLimitWith, getClientIP, rateLimitResponseWith } from '@/lib/rate-limiter'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req)
    const rl = checkRateLimitWith(ip, 5, 15 * 60 * 1000, 'signup')
    if (!rl.allowed) {
      return rateLimitResponseWith(rl, 5, 'Too many signup attempts. Try again in 15 minutes.')
    }

    const body = await req.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 422 }
      )
    }

    const { email, password, name } = parsed.data

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json(
        { success: false, error: 'Email already in use' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await db.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true },
    })

    const token = await signToken({ userId: user.id, email: user.email })
    const response = Response.json(
      { success: true, data: { user } },
      { status: 201 }
    )
    setSessionCookie(response, token)
    return response
  } catch (err) {
    console.error('signup error:', err)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
