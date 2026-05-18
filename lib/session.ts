import { SignJWT, jwtVerify } from 'jose'

export type SessionPayload = {
  userId: string
  email: string
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(secret)
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return {
    userId: payload.userId as string,
    email: payload.email as string,
  }
}

export async function getSessionFromRequest(req: Request): Promise<SessionPayload | null> {
  const cookieHeader = req.headers.get('cookie') ?? ''
  const match = cookieHeader.match(/qf_session=([^;]+)/)
  if (!match) return null
  try {
    return await verifyToken(match[1])
  } catch {
    return null
  }
}

export function setSessionCookie(response: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production'
  const maxAge = 60 * 60 * 24 * 30 // 30 days
  const cookieValue = [
    `qf_session=${token}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    ...(isProduction ? ['Secure'] : []),
  ].join('; ')
  response.headers.set('Set-Cookie', cookieValue)
}
