import { db } from '@/lib/db'
import { loginSchema } from '@/lib/validations'
import { signToken, setSessionCookie } from '@/lib/session'
import { checkRateLimitWith, getClientIP, rateLimitResponseWith } from '@/lib/rate-limiter'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req)
    const rl = checkRateLimitWith(ip, 5, 15 * 60 * 1000, 'login')
    if (!rl.allowed) {
      return rateLimitResponseWith(rl, 5, 'Too many login attempts. Try again in 15 minutes.')
    }

    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 422 }
      )
    }

    const { email, password } = parsed.data

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return Response.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return Response.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = await signToken({ userId: user.id, email: user.email })
    const response = Response.json({
      success: true,
      data: { user: { id: user.id, email: user.email, name: user.name } },
    })
    setSessionCookie(response, token)
    return response
  } catch (err) {
    console.error('login error:', err)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
