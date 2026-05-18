import { z } from 'zod'

// Note: QuoteFlow accepts logo URLs only, not file uploads.
// If file upload is added in future, implement MIME validation,
// UUID renaming, cloud storage, and 5MB size limits per security guidelines.

export const signupSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().min(1).max(100).optional(),
}).strict()

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
}).strict()

export const businessConfigSchema = z.object({
  name: z.string().min(1).max(100),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color'),
  logoUrl: z
    .string()
    .url()
    .max(500)
    .refine((v) => v.startsWith('https://'), { message: 'Logo URL must use https://' })
    .optional()
    .or(z.literal('')),
  websiteUrl: z.string().url().max(500).optional().or(z.literal('')),
  ownerEmail: z.string().email().max(254),
  notifyOnEveryLead: z.boolean().optional().default(true),
  notifyOnHighUrgency: z.boolean().optional().default(true),
  digestFrequency: z.enum(['instant', 'daily', 'weekly']).optional().default('instant'),
}).strict()

export const serviceSchema = z.object({
  name: z.string().min(1).max(100),
  questions: z.array(z.string().min(1).max(500)).min(1).max(7),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
}).strict()

export const pricingRuleSchema = z.object({
  tierLabel: z.string().min(1).max(100),
  minPrice: z.number().int().positive(),
  maxPrice: z.number().int().positive(),
  triggerKeyword: z.string().min(1).max(100),
}).strict()

export const leadStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CLOSED', 'ARCHIVED']),
}).strict()

export const createLeadSchema = z
  .object({
    prospectName:  z.string().min(2, 'Name must be at least 2 characters').max(100),
    prospectEmail: z.string().email('Invalid email address').max(254),
    serviceId:     z.string().min(1, 'Service is required').max(100),
    quoteMin:      z.coerce.number()
      .min(0, 'Quote must be positive')
      .max(999999, 'Quote cannot exceed $999,999')
      .int('Quote must be a whole number'),
    quoteMax:      z.coerce.number()
      .min(1, 'Quote must be at least $1')
      .max(999999, 'Quote cannot exceed $999,999')
      .int('Quote must be a whole number'),
    urgencyFlag:   z.enum(['HIGH', 'LOW']),
    status:        z.enum(['NEW', 'CONTACTED', 'CLOSED', 'ARCHIVED']),
    aiSummary:     z.string().max(2000).optional(),
  })
  .strict()
  .refine((d) => d.quoteMax > d.quoteMin, {
    message: 'Max quote must be greater than min quote',
    path: ['quoteMax'],
  })

export const intakeSubmitSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  conversationLog: z
    .array(
      z.object({
        question: z.string().min(1).max(500),
        answer: z.string().min(0).max(2000),
      }).strict()
    )
    .min(1, 'Conversation log is required')
    .max(20, 'Too many conversation entries'),
}).strict()

export const checkoutPlanSchema = z.object({
  plan: z.enum(['starter', 'pro', 'agency']),
}).strict()
