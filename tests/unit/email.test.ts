import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock nodemailer before importing email module
const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-message-id' })
const mockCreateTransport = vi.fn(() => ({ sendMail: mockSendMail }))

vi.mock('nodemailer', () => ({
  default: { createTransport: mockCreateTransport },
}))

// Set SMTP env vars
const originalEnv = process.env

beforeEach(() => {
  process.env = {
    ...originalEnv,
    SMTP_HOST: 'smtp.test.com',
    SMTP_PORT: '587',
    SMTP_USER: 'test@test.com',
    SMTP_PASS: 'test-pass',
    NEXTAUTH_URL: 'http://localhost:3000',
  }
  mockSendMail.mockClear()
  mockCreateTransport.mockClear()
})

afterEach(() => {
  process.env = originalEnv
})

const baseParams = {
  ownerEmail: 'owner@studio.com',
  prospectName: 'Sara Malik',
  prospectEmail: 'sara@malik.dev',
  serviceName: 'Landing Page Design',
  answers: {
    'What is your business name?': 'Sara Malik Consulting',
    'What is your ideal launch timeline?': 'I need this live in 3 weeks.',
  },
  aiSummary:
    'Sara needs a lead-gen landing page. Standard scope, tight timeline. Schedule kickoff in 48 hours.',
  urgencyFlag: 'HIGH' as const,
  quoteMin: 800,
  quoteMax: 1200,
  leadId: 'lead-abc-123',
}

describe('sendLeadNotification', () => {
  it('calls sendMail with correct recipient', async () => {
    const { sendLeadNotification } = await import('@/lib/email')
    await sendLeadNotification(baseParams)
    expect(mockSendMail).toHaveBeenCalledOnce()
    const [opts] = mockSendMail.mock.calls[0] as any[]
    expect(opts.to).toBe('owner@studio.com')
  })

  it('subject includes prospect name and service', async () => {
    const { sendLeadNotification } = await import('@/lib/email')
    await sendLeadNotification(baseParams)
    const [opts] = mockSendMail.mock.calls[0] as any[]
    expect(opts.subject).toContain('Sara Malik')
    expect(opts.subject).toContain('Landing Page Design')
  })

  it('subject includes quote range', async () => {
    const { sendLeadNotification } = await import('@/lib/email')
    await sendLeadNotification(baseParams)
    const [opts] = mockSendMail.mock.calls[0] as any[]
    expect(opts.subject).toContain('800')
    expect(opts.subject).toContain('1,200')
  })

  it('sends both html and text parts', async () => {
    const { sendLeadNotification } = await import('@/lib/email')
    await sendLeadNotification(baseParams)
    const [opts] = mockSendMail.mock.calls[0] as any[]
    expect(opts.html).toBeTruthy()
    expect(opts.text).toBeTruthy()
    expect(typeof opts.html).toBe('string')
    expect(typeof opts.text).toBe('string')
  })

  it('html contains prospect email', async () => {
    const { sendLeadNotification } = await import('@/lib/email')
    await sendLeadNotification(baseParams)
    const [opts] = mockSendMail.mock.calls[0] as any[]
    expect(opts.html).toContain('sara@malik.dev')
  })

  it('html contains dashboard link with leadId', async () => {
    const { sendLeadNotification } = await import('@/lib/email')
    await sendLeadNotification(baseParams)
    const [opts] = mockSendMail.mock.calls[0] as any[]
    expect(opts.html).toContain('lead-abc-123')
    expect(opts.html).toContain('localhost:3000')
  })

  it('does not throw when SMTP_HOST is not set', async () => {
    delete process.env.SMTP_HOST
    const { sendLeadNotification } = await import('@/lib/email')
    await expect(sendLeadNotification(baseParams)).resolves.not.toThrow()
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('does not send when SMTP_USER is missing', async () => {
    delete process.env.SMTP_USER
    const { sendLeadNotification } = await import('@/lib/email')
    await sendLeadNotification(baseParams)
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('uses createTransport with correct SMTP config', async () => {
    const { sendLeadNotification } = await import('@/lib/email')
    await sendLeadNotification(baseParams)
    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.test.com',
        port: 587,
        auth: expect.objectContaining({ user: 'test@test.com' }),
      })
    )
  })
})
