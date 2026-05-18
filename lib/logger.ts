// Structured JSON logger for server-side API routes.
// Future: replace console.error with Sentry or Logtail for aggregated log management.
// https://logtail.com/integrations/nextjs or https://sentry.io/for/nextjs/

type LogLevel = 'info' | 'warn' | 'error'

export function log(
  level: LogLevel,
  route: string,
  message: string,
  meta?: Record<string, unknown>
): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    route,
    message,
    ...meta,
  }
  console.error(JSON.stringify(entry))
}
