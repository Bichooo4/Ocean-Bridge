// Client Component — Recharts LineChart showing monthly revenue trend.
'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

interface RevenueOverTimeProps {
  data: { month: string; revenue: number }[]
}

function formatYAxis(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
  return `$${value}`
}

export function RevenueOverTime({ data }: RevenueOverTimeProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#4A90D9"
          strokeWidth={2.5}
          dot={{ fill: '#1B2E5E', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#4A90D9' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
