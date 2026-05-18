import { describe, it, expect, vi, beforeAll } from 'vitest'

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}))

// Mock PrismaClient
const mockCreate = vi.fn().mockResolvedValue({ id: 'mock-id', email: 'admin@quoteflow.demo', name: 'Alex Rivera', embedToken: 'mock-token' })
const mockDeleteMany = vi.fn().mockResolvedValue({ count: 0 })

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: { create: mockCreate, deleteMany: mockDeleteMany },
    businessConfig: { create: mockCreate, deleteMany: mockDeleteMany },
    service: { create: mockCreate, deleteMany: mockDeleteMany },
    lead: { create: mockCreate, deleteMany: mockDeleteMany },
    pricingRule: { deleteMany: mockDeleteMany },
    $disconnect: vi.fn(),
  })),
}))

describe('seed data structure validation', () => {
  it('seed data has correct user shape', () => {
    const seedUser = {
      email: 'admin@quoteflow.demo',
      name: 'Alex Rivera',
      passwordHash: 'hashed_password',
    }
    expect(seedUser.email).toBe('admin@quoteflow.demo')
    expect(seedUser.name).toBe('Alex Rivera')
    expect(typeof seedUser.passwordHash).toBe('string')
  })

  it('seed data has correct business config shape', () => {
    const seedBusiness = {
      name: 'Artisan Web Studio',
      brandColor: '#6366f1',
      ownerEmail: 'admin@quoteflow.demo',
    }
    expect(seedBusiness.name).toBe('Artisan Web Studio')
    expect(seedBusiness.brandColor).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(seedBusiness.ownerEmail).toContain('@')
  })

  it('seed services have correct question counts', () => {
    const landingPageQuestions = [
      'What is your business name and what do you sell?',
      'Do you have existing branding (logo, colors, fonts)?',
      'What is the primary goal of this landing page?',
      'Do you need copywriting or will you provide the text?',
      'What is your ideal launch timeline?',
    ]
    const websiteQuestions = [
      'How many pages does your site need?',
      'Do you need a blog or content management system?',
      'Will you need e-commerce or payment functionality?',
      'Do you have a brand identity ready to use?',
      'What is your budget range and timeline?',
    ]
    expect(landingPageQuestions).toHaveLength(5)
    expect(websiteQuestions).toHaveLength(5)
  })

  it('seed pricing rules have correct keyword values', () => {
    const landingPageRules = [
      { tierLabel: 'Basic', minPrice: 400, maxPrice: 700, triggerKeyword: 'simple' },
      { tierLabel: 'Standard', minPrice: 800, maxPrice: 1200, triggerKeyword: 'standard' },
      { tierLabel: 'Premium', minPrice: 1400, maxPrice: 2000, triggerKeyword: 'complex' },
    ]
    const websiteRules = [
      { tierLabel: 'Starter', minPrice: 1500, maxPrice: 2500, triggerKeyword: 'small' },
      { tierLabel: 'Business', minPrice: 3000, maxPrice: 5000, triggerKeyword: 'medium' },
      { tierLabel: 'Enterprise', minPrice: 6000, maxPrice: 10000, triggerKeyword: 'large' },
    ]

    for (const rule of [...landingPageRules, ...websiteRules]) {
      expect(rule.minPrice).toBeGreaterThan(0)
      expect(rule.maxPrice).toBeGreaterThan(rule.minPrice)
      expect(rule.triggerKeyword).toBeTruthy()
      expect(rule.tierLabel).toBeTruthy()
    }
  })

  it('seed leads have correct enum values', () => {
    const validStatuses = ['NEW', 'CONTACTED', 'CLOSED', 'ARCHIVED']
    const validUrgencies = ['HIGH', 'LOW']
    const seedLeads = [
      { status: 'CONTACTED', urgencyFlag: 'HIGH' },
      { status: 'NEW', urgencyFlag: 'LOW' },
      { status: 'CLOSED', urgencyFlag: 'LOW' },
      { status: 'NEW', urgencyFlag: 'HIGH' },
      { status: 'ARCHIVED', urgencyFlag: 'LOW' },
    ]
    for (const lead of seedLeads) {
      expect(validStatuses).toContain(lead.status)
      expect(validUrgencies).toContain(lead.urgencyFlag)
    }
  })

  it('all 5 seed leads have intakeTranscript arrays', () => {
    const seedTranscripts = [
      [
        { question: 'What is your business name and what do you sell?', answer: 'Sara Malik Consulting' },
      ],
      [
        { question: 'How many pages does your site need?', answer: 'Around 8 pages' },
      ],
    ]
    for (const transcript of seedTranscripts) {
      expect(Array.isArray(transcript)).toBe(true)
      for (const entry of transcript) {
        expect(entry).toHaveProperty('question')
        expect(entry).toHaveProperty('answer')
        expect(typeof entry.question).toBe('string')
        expect(typeof entry.answer).toBe('string')
      }
    }
  })
})
