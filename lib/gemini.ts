const PRIMARY_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const FALLBACK_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent'

const GENERATION_CONFIG = {
  temperature: 0.4,
  topK: 32,
  topP: 0.95,
  maxOutputTokens: 1024,
}

const GEMINI_TIMEOUT_MS = 10_000

const INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /system prompt/i,
  /you are now/i,
  /disregard/i,
  /forget everything/i,
  /<script/i,
  /javascript:/i,
]

export function sanitizeForAI(text: string): string {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      throw new Error('Invalid input detected')
    }
  }
  return text
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .trim()
    .slice(0, 2000)
}

export function extractGeminiText(response: unknown): string {
  const raw = (response as { candidates: { content: { parts: { text: string }[] } }[] })
    .candidates[0].content.parts[0].text
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini timeout')), ms)
    ),
  ])
}

export async function callGemini(prompt: string): Promise<string> {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: GENERATION_CONFIG,
  }

  const geminiHeaders = {
    'Content-Type': 'application/json',
    'x-goog-api-key': process.env.GEMINI_API_KEY ?? '',
  }

  const fetchPrimary = fetch(PRIMARY_URL, {
    method: 'POST',
    headers: geminiHeaders,
    body: JSON.stringify(body),
  })

  let res = await withTimeout(fetchPrimary, GEMINI_TIMEOUT_MS)

  if (res.status === 503) {
    const fetchFallback = fetch(FALLBACK_URL, {
      method: 'POST',
      headers: geminiHeaders,
      body: JSON.stringify(body),
    })
    res = await withTimeout(fetchFallback, GEMINI_TIMEOUT_MS)
  }

  if (!res.ok) {
    throw new Error('AI service unavailable')
  }

  const data = await res.json()
  const result = extractGeminiText(data)

  // Future: implement per-user token budget via Redis counter when multi-instance support is added.

  return result
}
