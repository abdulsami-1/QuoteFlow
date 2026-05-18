import type { PricingRule } from '@prisma/client'

export interface PricingResult {
  minPrice: number
  maxPrice: number
  tierLabel: string
  matched: boolean
}

export function matchPricingRule(
  decisionKey: string,
  rules: PricingRule[]
): PricingResult {
  const normalized = decisionKey.trim().toLowerCase()

  const match = rules.find(
    (r) => r.triggerKeyword.trim().toLowerCase() === normalized
  )

  if (match) {
    return {
      minPrice: match.minPrice,
      maxPrice: match.maxPrice,
      tierLabel: match.tierLabel,
      matched: true,
    }
  }

  const sorted = [...rules].sort((a, b) => a.minPrice - b.minPrice)
  const fallback = sorted[0]

  if (!fallback) {
    return { minPrice: 0, maxPrice: 0, tierLabel: 'Unknown', matched: false }
  }

  return {
    minPrice: fallback.minPrice,
    maxPrice: fallback.maxPrice,
    tierLabel: fallback.tierLabel,
    matched: false,
  }
}

export function isValidDecisionKey(key: string, rules: PricingRule[]): boolean {
  const normalized = key.trim().toLowerCase()
  return rules.some((r) => r.triggerKeyword.trim().toLowerCase() === normalized)
}
