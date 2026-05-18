'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface LeadsPerDay {
  date: string
  count: number
}

interface Props {
  data: LeadsPerDay[]
}

function formatTick(iso: string) {
  const [, m, d] = iso.split('-')
  return `${Number(m)}/${Number(d)}`
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg px-3 py-2.5 text-[12px] shadow-lg"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-strong)',
      }}
    >
      <p className="text-fg-tertiary mb-1">{label ? formatTick(label) : ''}</p>
      <p className="text-brand font-semibold tabular-nums">
        {payload[0].value} {payload[0].value === 1 ? 'lead' : 'leads'}
      </p>
    </div>
  )
}

export function LeadsBarChart({ data }: Props) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  const ticked = data.filter((_, i) => i % 5 === 0 || i === data.length - 1)
  const tickDates = new Set(ticked.map((d) => d.date))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border-subtle)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: 'var(--fg-tertiary)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (tickDates.has(v) ? formatTick(v) : '')}
        />
        <YAxis
          tick={{ fill: 'var(--fg-tertiary)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border-subtle)', radius: 4 }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={20} name="Leads">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.count === maxCount
                  ? '#5B87F2'
                  : `rgba(91,135,242,${Math.max(0.25, entry.count / maxCount * 0.85)})`
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
