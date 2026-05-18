import nodemailer from 'nodemailer'
import { buildLeadEmailHtml, buildLeadEmailText } from './email-templates'

export interface LeadNotificationParams {
  ownerEmail: string
  prospectName: string
  prospectEmail: string
  serviceName: string
  answers: Record<string, string>
  aiSummary: string
  urgencyFlag: 'HIGH' | 'LOW'
  quoteMin: number
  quoteMax: number
  leadId: string
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  })
}

export async function sendLeadNotification(params: LeadNotificationParams): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return

  const dashboardUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const transporter = createTransporter()

  await transporter.sendMail({
    from: `"QuoteFlow" <${process.env.SMTP_USER}>`,
    to: params.ownerEmail,
    subject: `New Lead: ${params.prospectName} — ${params.serviceName} — $${params.quoteMin.toLocaleString()}–$${params.quoteMax.toLocaleString()}`,
    html: buildLeadEmailHtml({ ...params, dashboardUrl }),
    text: buildLeadEmailText({ ...params, dashboardUrl }),
  })
}
