import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, _resetForTest, _getEntryForTest } from '@/lib/rate-limiter'

const TEST_IP = '192.168.1.1'

describe('checkRateLimit', () => {
  beforeEach(() => {
    _resetForTest(TEST_IP)
  })

  it('allows first request', () => {
    const result = checkRateLimit(TEST_IP)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9)
  })

  it('allows up to 10 requests', () => {
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit(TEST_IP)
      expect(result.allowed).toBe(true)
    }
  })

  it('blocks 11th request', () => {
    for (let i = 0; i < 10; i++) checkRateLimit(TEST_IP)
    const result = checkRateLimit(TEST_IP)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('blocks 12th request too', () => {
    for (let i = 0; i < 12; i++) checkRateLimit(TEST_IP)
    const result = checkRateLimit(TEST_IP)
    expect(result.allowed).toBe(false)
  })

  it('different IPs are tracked independently', () => {
    const ip2 = '10.0.0.1'
    _resetForTest(ip2)
    for (let i = 0; i < 10; i++) checkRateLimit(TEST_IP)
    // ip2 should still be allowed
    expect(checkRateLimit(ip2).allowed).toBe(true)
    _resetForTest(ip2)
  })

  it('tracks remaining count correctly', () => {
    checkRateLimit(TEST_IP) // 1 → remaining=9
    checkRateLimit(TEST_IP) // 2 → remaining=8
    const result = checkRateLimit(TEST_IP) // 3 → remaining=7
    expect(result.remaining).toBe(7)
  })

  it('returns resetAt in the future', () => {
    const result = checkRateLimit(TEST_IP)
    expect(result.resetAt).toBeGreaterThan(Date.now())
  })

  it('resets after window expires (mocked via clearing)', () => {
    for (let i = 0; i < 10; i++) checkRateLimit(TEST_IP)
    expect(checkRateLimit(TEST_IP).allowed).toBe(false)

    // Manually expire the entry
    const entry = _getEntryForTest(TEST_IP)!
    entry.resetAt = Date.now() - 1

    // Next call should reset the window
    const result = checkRateLimit(TEST_IP)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9)
  })
})
