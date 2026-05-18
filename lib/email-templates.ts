interface LeadEmailParams {
  prospectName: string
  prospectEmail: string
  serviceName: string
  answers: Record<string, string>
  aiSummary: string
  urgencyFlag: 'HIGH' | 'LOW'
  quoteMin: number
  quoteMax: number
  leadId: string
  dashboardUrl: string
}

export function buildLeadEmailHtml(p: LeadEmailParams): string {
  const answersHtml = Object.entries(p.answers)
    .map(
      ([q, a]) =>
        `<tr><td style="padding:8px 0;color:#71717a;font-size:13px">${q}</td></tr><tr><td style="padding:0 0 16px;color:#fafafa;font-size:14px">${a}</td></tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#18181b;border-radius:12px;border:1px solid #27272a;overflow:hidden">
    <div style="background:#6366f1;padding:24px 32px">
      <p style="margin:0;color:rgba(255,255,255,0.7);font-size:12px;text-transform:uppercase;letter-spacing:0.1em">New Lead</p>
      <h1 style="margin:4px 0 0;color:#fff;font-size:24px;font-weight:600">${p.prospectName}</h1>
    </div>
    <div style="padding:32px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:0 0 24px">
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <span style="background:#27272a;color:#fafafa;padding:4px 12px;border-radius:6px;font-size:13px">${p.serviceName}</span>
              <span style="background:${p.urgencyFlag === 'HIGH' ? '#7f1d1d' : '#27272a'};color:${p.urgencyFlag === 'HIGH' ? '#fca5a5' : '#71717a'};padding:4px 12px;border-radius:6px;font-size:13px">${p.urgencyFlag} URGENCY</span>
              <span style="background:#1e1b4b;color:#a5b4fc;padding:4px 12px;border-radius:6px;font-size:13px">$${p.quoteMin.toLocaleString()}–$${p.quoteMax.toLocaleString()}</span>
            </div>
          </td>
        </tr>
        <tr><td style="padding:0 0 8px;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;border-top:1px solid #27272a;padding-top:24px">Contact</td></tr>
        <tr><td style="padding:8px 0 24px;color:#fafafa;font-size:14px">${p.prospectEmail}</td></tr>
        <tr><td style="padding:0 0 8px;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;border-top:1px solid #27272a;padding-top:24px">AI Summary</td></tr>
        <tr><td style="padding:8px 0 24px;color:#fafafa;font-size:14px;line-height:1.6">${p.aiSummary}</td></tr>
        <tr><td style="padding:0 0 8px;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;border-top:1px solid #27272a;padding-top:24px">Intake Answers</td></tr>
        ${answersHtml}
      </table>
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #27272a">
        <a href="${p.dashboardUrl}/dashboard/leads/${p.leadId}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">View Lead in Dashboard →</a>
      </div>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #27272a;background:#09090b">
      <p style="margin:0;color:#3f3f46;font-size:12px">Powered by QuoteFlow</p>
    </div>
  </div>
</body>
</html>`
}

export function buildLeadEmailText(p: LeadEmailParams): string {
  const answers = Object.entries(p.answers)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join('\n\n')
  return `New Lead: ${p.prospectName}
Service: ${p.serviceName}
Contact: ${p.prospectEmail}
Urgency: ${p.urgencyFlag}
Quote: $${p.quoteMin.toLocaleString()}–$${p.quoteMax.toLocaleString()}

AI Summary:
${p.aiSummary}

Intake Answers:
${answers}

View in Dashboard: ${p.dashboardUrl}/dashboard/leads/${p.leadId}`
}
