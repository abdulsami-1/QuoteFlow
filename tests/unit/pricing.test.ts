import { describe, it, expect } from 'vitest'
import { matchPricingRule, isValidDecisionKey } from '@/lib/pricing'
import type { PricingRule } from '@prisma/client'

const mockRules: PricingRule[] = [
  {
    id: 'rule-1',
    serviceId: 'svc-1',
    tierLabel: 'Basic',
    minPrice: 400,
    maxPrice: 700,
    triggerKeyword: 'simple',
  },
  {
    id: 'rule-2',
    serviceId: 'svc-1',
    tierLabel: 'Standard',
    minPrice: 800,
    maxPrice: 1200,
    triggerKeyword: 'standard',
  },
  {
    id: 'rule-3',
    serviceId: 'svc-1',
    tierLabel: 'Premium',
    minPrice: 1400,
    maxPrice: 2000,
    triggerKeyword: 'complex',
  },
]

describe('matchPricingRule', () => {
  it('returns correct tier for exact match: simple', () => {
    const result = matchPricingRule('simple', mockRules)
    expect(result.matched).toBe(true)
    expect(result.tierLabel).toBe('Basic')
    expect(result.minPrice).toBe(400)
    expect(result.maxPrice).toBe(700)
  })

  it('returns correct tier for exact match: standard', () => {
    const result = matchPricingRule('standard', mockRules)
    expect(result.matched).toBe(true)
    expect(result.tierLabel).toBe('Standard')
    expect(result.minPrice).toBe(800)
    expect(result.maxPrice).toBe(1200)
  })

  it('returns correct tier for exact match: complex', () => {
    const result = matchPricingRule('complex', mockRules)
    expect(result.matched).toBe(true)
    expect(result.tierLabel).toBe('Premium')
    expect(result.minPrice).toBe(1400)
    expect(result.maxPrice).toBe(2000)
  })

  it('matches case-insensitively: SIMPLE → Basic', () => {
    const result = matchPricingRule('SIMPLE', mockRules)
    expect(result.matched).toBe(true)
    expect(result.tierLabel).toBe('Basic')
  })

  it('matches case-insensitively: STANDARD → Standard', () => {
    const result = matchPricingRule('Standard', mockRules)
    expect(result.matched).toBe(true)
    expect(result.tierLabel).toBe('Standard')
  })

  it('matches with surrounding whitespace', () => {
    const result = matchPricingRule('  complex  ', mockRules)
    expect(result.matched).toBe(true)
    expect(result.tierLabel).toBe('Premium')
  })

  it('returns lowest tier fallback for unknown key', () => {
    const result = matchPricingRule('enterprise', mockRules)
    expect(result.matched).toBe(false)
    expect(result.tierLabel).toBe('Basic')
    expect(result.minPrice).toBe(400)
    expect(result.maxPrice).toBe(700)
  })

  it('returns zeroes when no rules configured', () => {
    const result = matchPricingRule('simple', [])
    expect(result.matched).toBe(false)
    expect(result.minPrice).toBe(0)
    expect(result.maxPrice).toBe(0)
    expect(result.tierLabel).toBe('Unknown')
  })
})

describe('isValidDecisionKey', () => {
  it('returns true for valid key', () => {
    expect(isValidDecisionKey('simple', mockRules)).toBe(true)
    expect(isValidDecisionKey('standard', mockRules)).toBe(true)
    expect(isValidDecisionKey('complex', mockRules)).toBe(true)
  })

  it('returns true for case-insensitive match', () => {
    expect(isValidDecisionKey('COMPLEX', mockRules)).toBe(true)
    expect(isValidDecisionKey('Standard', mockRules)).toBe(true)
  })

  it('returns false for invalid key', () => {
    expect(isValidDecisionKey('enterprise', mockRules)).toBe(false)
    expect(isValidDecisionKey('', mockRules)).toBe(false)
    expect(isValidDecisionKey('unknown', mockRules)).toBe(false)
  })

  it('returns false for any key when rules are empty', () => {
    expect(isValidDecisionKey('simple', [])).toBe(false)
  })
})
