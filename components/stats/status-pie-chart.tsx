'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface StatusDistribution {
  status: string
  count: number
}

interface Props {
  data: StatusDistribution[]
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  NEW:       { color: '#8b5cf6', label: 'New' },
  CONTACTED: { color: '#6366f1', label: 'Contacted' },
  CLOSED:    { color: '#22c55e', label: 'Closed' },
  ARCHIVED:  { color: '#71717a', label: 'Archived' },
}

const DEFAULT_COLOR = '#575A70'

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  const cfg = STATUS_CONFIG[payload[0].name] ?? { color: DEFAULT_COLOR, label: payload[0].name }
  return (
    <div
      className="rounded-lg px-3 py-2.5 text-[12px] shadow-lg"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-strong)',
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full shrink-0"
          style={{ background: cfg.color }}
        />
        <span className="text-fg-secondary font-medium">{cfg.label}</span>
        <span className="text-fg-primary font-semibold ml-1 tabular-nums">{payload[0].value}</span>
      </div>
    </div>
  )
}

export function StatusPieChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-55 gap-3">
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center"
          style={{ border: '3px dashed var(--border-subtle)' }}
        >
          <span className="text-[22px] font-bold text-fg-disabled">0</span>
        </div>
        <p className="text-[13px] text-fg-tertiary">No leads yet</p>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          innerRadius={52}
          outerRadius={78}
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_CONFIG[entry.status]?.color ?? DEFAULT_COLOR}
            />
          ))}
        </Pie>
        {/* Centre label rendered via foreignObject trick via recharts label prop */}
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ paddingTop: 8, fontSize: 12 }}
          formatter={(v) => (
            <span style={{ color: 'var(--fg-secondary)' }}>
              {STATUS_CONFIG[v]?.label ?? v}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
