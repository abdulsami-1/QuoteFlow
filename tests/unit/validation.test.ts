import { describe, it, expect } from 'vitest'
import { createLeadSchema } from '@/lib/validations'

const validBase = {
  prospectName: 'Jane Smith',
  prospectEmail: 'jane@example.com',
  serviceId: 'svc-abc123',
  quoteMin: 500,
  quoteMax: 1500,
  urgencyFlag: 'LOW' as const,
  status: 'NEW' as const,
}

describe('createLeadSchema — quoteMin', () => {
  it('accepts 0', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMin: 0, quoteMax: 1 })
    expect(r.success).toBe(true)
  })

  it('rejects negative value', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMin: -1 })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.quoteMin).toBeDefined()
  })

  it('accepts 999999 (boundary)', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMin: 999998, quoteMax: 999999 })
    expect(r.success).toBe(true)
  })

  it('rejects 1000000 (overflow boundary)', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMin: 1000000 })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.quoteMin).toBeDefined()
  })

  it('rejects INT4 overflow value', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMin: 2_147_483_648 })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.quoteMin).toBeDefined()
  })

  it('rejects decimal value', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMin: 100.5, quoteMax: 200 })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.quoteMin).toBeDefined()
  })
})

describe('createLeadSchema — quoteMax', () => {
  it('rejects 0', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMax: 0 })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.quoteMax).toBeDefined()
  })

  it('accepts 1 (minimum)', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMin: 0, quoteMax: 1 })
    expect(r.success).toBe(true)
  })

  it('rejects 1000000 (overflow boundary)', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMax: 1000000 })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.quoteMax).toBeDefined()
  })

  it('rejects INT4 overflow value', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMax: 2_147_483_648 })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.quoteMax).toBeDefined()
  })

  it('rejects decimal value', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMax: 1500.99 })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.flatten().fieldErrors.quoteMax).toBeDefined()
  })
})

describe('createLeadSchema — cross-field refine', () => {
  it('rejects when quoteMax <= quoteMin', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMin: 500, quoteMax: 500 })
    expect(r.success).toBe(false)
    if (!r.success) {
      const flat = r.error.flatten()
      expect(flat.fieldErrors.quoteMax).toBeDefined()
    }
  })

  it('rejects when quoteMax < quoteMin', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMin: 1000, quoteMax: 500 })
    expect(r.success).toBe(false)
  })

  it('accepts when quoteMax > quoteMin', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMin: 500, quoteMax: 1500 })
    expect(r.success).toBe(true)
  })
})

describe('createLeadSchema — coercion from string (form input)', () => {
  it('coerces string "500" to number 500', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMin: '500', quoteMax: '1500' })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.quoteMin).toBe(500)
      expect(r.data.quoteMax).toBe(1500)
    }
  })

  it('rejects non-numeric string', () => {
    const r = createLeadSchema.safeParse({ ...validBase, quoteMin: 'abc', quoteMax: 'xyz' })
    expect(r.success).toBe(false)
  })
})
