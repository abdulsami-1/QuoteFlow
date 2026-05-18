import { describe, it, expect } from 'vitest'
import {
  computeAvgQuoteValue,
  computeConversionRate,
  computeLeadsPerDay,
  computeStatusDistribution,
} from '@/lib/stats'

const makeLeads = (
  entries: Array<{ quoteMin: number; quoteMax: number; status: string }>
) => entries

describe('computeAvgQuoteValue', () => {
  it('returns 0 for empty array', () => {
    expect(computeAvgQuoteValue([])).toBe(0)
  })

  it('computes midpoint average for single lead', () => {
    expect(computeAvgQuoteValue([{ quoteMin: 800, quoteMax: 1200, status: 'NEW' }])).toBe(1000)
  })

  it('rounds to nearest integer', () => {
    const leads = makeLeads([
      { quoteMin: 100, quoteMax: 200, status: 'NEW' },
      { quoteMin: 200, quoteMax: 300, status: 'NEW' },
    ])
    // midpoints: 150, 250 → avg 200
    expect(computeAvgQuoteValue(leads)).toBe(200)
  })

  it('handles multiple leads correctly', () => {
    const leads = makeLeads([
      { quoteMin: 500, quoteMax: 1000, status: 'NEW' },
      { quoteMin: 1000, quoteMax: 2000, status: 'CLOSED' },
      { quoteMin: 0, quoteMax: 500, status: 'NEW' },
    ])
    // midpoints: 750, 1500, 250 → sum 2500 / 3 = 833.3 → rounds to 833
    expect(computeAvgQuoteValue(leads)).toBe(833)
  })
})

describe('computeConversionRate', () => {
  it('returns 0 for empty array', () => {
    expect(computeConversionRate([])).toBe(0)
  })

  it('returns 100 when all leads closed', () => {
    const leads = makeLeads([
      { quoteMin: 100, quoteMax: 200, status: 'CLOSED' },
      { quoteMin: 200, quoteMax: 300, status: 'CLOSED' },
    ])
    expect(computeConversionRate(leads)).toBe(100)
  })

  it('returns 0 when no leads closed', () => {
    const leads = makeLeads([
      { quoteMin: 100, quoteMax: 200, status: 'NEW' },
      { quoteMin: 200, quoteMax: 300, status: 'CONTACTED' },
    ])
    expect(computeConversionRate(leads)).toBe(0)
  })

  it('computes partial conversion rate', () => {
    const leads = makeLeads([
      { quoteMin: 100, quoteMax: 200, status: 'CLOSED' },
      { quoteMin: 200, quoteMax: 300, status: 'NEW' },
      { quoteMin: 300, quoteMax: 400, status: 'NEW' },
      { quoteMin: 400, quoteMax: 500, status: 'NEW' },
    ])
    // 1/4 = 25%
    expect(computeConversionRate(leads)).toBe(25)
  })

  it('rounds to nearest integer', () => {
    const leads = makeLeads([
      { quoteMin: 100, quoteMax: 200, status: 'CLOSED' },
      { quoteMin: 200, quoteMax: 300, status: 'NEW' },
      { quoteMin: 300, quoteMax: 400, status: 'NEW' },
    ])
    // 1/3 = 33.3 → 33
    expect(computeConversionRate(leads)).toBe(33)
  })
})

describe('computeLeadsPerDay', () => {
  it('returns array of length daysBack', () => {
    const result = computeLeadsPerDay([], 7)
    expect(result).toHaveLength(7)
  })

  it('defaults to 30 days', () => {
    const result = computeLeadsPerDay([])
    expect(result).toHaveLength(30)
  })

  it('all counts zero with no leads', () => {
    const result = computeLeadsPerDay([], 7)
    expect(result.every((d) => d.count === 0)).toBe(true)
  })

  it('counts lead on correct day', () => {
    const today = new Date().toISOString()
    const result = computeLeadsPerDay([{ createdAt: today }], 7)
    const todayKey = new Date().toISOString().slice(0, 10)
    const todayEntry = result.find((d) => d.date === todayKey)
    expect(todayEntry?.count).toBe(1)
  })

  it('ignores leads outside window', () => {
    const old = new Date()
    old.setDate(old.getDate() - 100)
    const result = computeLeadsPerDay([{ createdAt: old.toISOString() }], 7)
    expect(result.every((d) => d.count === 0)).toBe(true)
  })

  it('accumulates multiple leads on same day', () => {
    const today = new Date().toISOString()
    const result = computeLeadsPerDay(
      [{ createdAt: today }, { createdAt: today }, { createdAt: today }],
      7
    )
    const todayKey = new Date().toISOString().slice(0, 10)
    const todayEntry = result.find((d) => d.date === todayKey)
    expect(todayEntry?.count).toBe(3)
  })
})

describe('computeStatusDistribution', () => {
  it('returns empty array for no leads', () => {
    expect(computeStatusDistribution([])).toEqual([])
  })

  it('groups by status', () => {
    const leads = makeLeads([
      { quoteMin: 0, quoteMax: 0, status: 'NEW' },
      { quoteMin: 0, quoteMax: 0, status: 'NEW' },
      { quoteMin: 0, quoteMax: 0, status: 'CLOSED' },
    ])
    const result = computeStatusDistribution(leads)
    const newEntry = result.find((r) => r.status === 'NEW')
    const closedEntry = result.find((r) => r.status === 'CLOSED')
    expect(newEntry?.count).toBe(2)
    expect(closedEntry?.count).toBe(1)
  })

  it('handles all same status', () => {
    const leads = makeLeads([
      { quoteMin: 0, quoteMax: 0, status: 'CONTACTED' },
      { quoteMin: 0, quoteMax: 0, status: 'CONTACTED' },
    ])
    const result = computeStatusDistribution(leads)
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('CONTACTED')
    expect(result[0].count).toBe(2)
  })
})
