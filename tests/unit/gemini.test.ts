import { describe, it, expect } from 'vitest'
import { extractGeminiText } from '@/lib/gemini'

function makeGeminiResponse(text: string) {
  return {
    candidates: [
      {
        content: {
          parts: [{ text }],
        },
      },
    ],
  }
}

describe('extractGeminiText', () => {
  it('strips ```json ... ``` fences', () => {
    const response = makeGeminiResponse('```json\n{"key": "value"}\n```')
    const result = extractGeminiText(response)
    expect(result).toBe('{"key": "value"}')
  })

  it('strips ``` ... ``` fences (no language tag)', () => {
    const response = makeGeminiResponse('```\n{"key": "value"}\n```')
    const result = extractGeminiText(response)
    expect(result).toBe('{"key": "value"}')
  })

  it('returns plain JSON as-is', () => {
    const json = '{"decisionKey": "simple", "urgencyFlag": "LOW"}'
    const response = makeGeminiResponse(json)
    const result = extractGeminiText(response)
    expect(result).toBe(json)
  })

  it('trims surrounding whitespace', () => {
    const response = makeGeminiResponse('  {"key": "value"}  ')
    const result = extractGeminiText(response)
    expect(result).toBe('{"key": "value"}')
  })

  it('handles JSON fence with uppercase JSON tag', () => {
    const response = makeGeminiResponse('```JSON\n{"key": "value"}\n```')
    const result = extractGeminiText(response)
    expect(result).toBe('{"key": "value"}')
  })

  it('returns plain text summary unchanged', () => {
    const text =
      'The prospect needs a landing page for their photography business. Scope is simple with no special requirements. Send a proposal within 3 days.'
    const response = makeGeminiResponse(text)
    const result = extractGeminiText(response)
    expect(result).toBe(text)
  })
})
