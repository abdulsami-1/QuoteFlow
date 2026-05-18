export interface LeadForStats {
  quoteMin: number
  quoteMax: number
  status: string
}

export interface LeadDateEntry {
  createdAt: Date | string
}

export interface LeadsPerDay {
  date: string
  count: number
}

export interface StatusDistribution {
  status: string
  count: number
}

export function computeAvgQuoteValue(leads: LeadForStats[]): number {
  if (leads.length === 0) return 0
  const sum = leads.reduce((acc, l) => acc + (l.quoteMin + l.quoteMax) / 2, 0)
  return Math.round(sum / leads.length)
}

export function computeConversionRate(leads: LeadForStats[]): number {
  if (leads.length === 0) return 0
  const closed = leads.filter((l) => l.status === 'CLOSED').length
  return Math.round((closed / leads.length) * 100)
}

export function computeLeadsPerDay(leads: LeadDateEntry[], daysBack = 30): LeadsPerDay[] {
  const dayMap = new Map<string, number>()
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dayMap.set(d.toISOString().slice(0, 10), 0)
  }
  for (const lead of leads) {
    const key = new Date(lead.createdAt).toISOString().slice(0, 10)
    if (dayMap.has(key)) {
      dayMap.set(key, (dayMap.get(key) ?? 0) + 1)
    }
  }
  return Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }))
}

export function computeStatusDistribution(leads: LeadForStats[]): StatusDistribution[] {
  const map = new Map<string, number>()
  for (const lead of leads) {
    map.set(lead.status, (map.get(lead.status) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([status, count]) => ({ status, count }))
}
