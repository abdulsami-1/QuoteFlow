import { describe, it, expect } from 'vitest'

// Isolated guard logic — mirrors the check in keyboard-shortcuts.tsx
function shouldSkipKey(key: KeyboardEvent['key']): boolean {
  return !key || typeof key !== 'string'
}

function resolveKey(e: Partial<KeyboardEvent>): string | null {
  if (!e.key || typeof e.key !== 'string') return null
  return e.key.toLowerCase()
}

describe('keyboard shortcut key guard', () => {
  it('skips when key is undefined', () => {
    expect(shouldSkipKey(undefined as unknown as string)).toBe(true)
  })

  it('skips when key is null', () => {
    expect(shouldSkipKey(null as unknown as string)).toBe(true)
  })

  it('skips when key is empty string', () => {
    expect(shouldSkipKey('')).toBe(true)
  })

  it('skips when key is a non-string (number)', () => {
    expect(shouldSkipKey(123 as unknown as string)).toBe(true)
  })

  it('passes for normal character key', () => {
    expect(shouldSkipKey('l')).toBe(false)
  })

  it('passes for special key name', () => {
    expect(shouldSkipKey('Escape')).toBe(false)
  })

  it('passes for slash', () => {
    expect(shouldSkipKey('/')).toBe(false)
  })
})

describe('resolveKey toLowerCase', () => {
  it('returns null for undefined key — no throw', () => {
    expect(resolveKey({ key: undefined })).toBeNull()
  })

  it('returns null for null key — no throw', () => {
    expect(resolveKey({ key: null as unknown as string })).toBeNull()
  })

  it('lowercases normal key', () => {
    expect(resolveKey({ key: 'L' })).toBe('l')
  })

  it('lowercases Escape', () => {
    expect(resolveKey({ key: 'Escape' })).toBe('escape')
  })

  it('returns slash unchanged', () => {
    expect(resolveKey({ key: '/' })).toBe('/')
  })

  it('does not throw for media key with undefined .key', () => {
    expect(() => resolveKey({ key: undefined })).not.toThrow()
  })
})
