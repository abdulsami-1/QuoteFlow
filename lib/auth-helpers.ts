import { verifyToken } from './session'
import type { SessionPayload } from './session'

export async function requireAuth(request: Request): Promise<SessionPayload> {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(/qf_session=([^;]+)/)
  if (!match) {
    throw new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }
  try {
    return await verifyToken(match[1])
  } catch {
    throw new Response(
      JSON.stringify({ success: false, error: 'Invalid session' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
