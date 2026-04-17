'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  'Pending':          '#F59E0B',
  'Approved':         '#4A90D9',
  'Out for Delivery': '#8B5CF6',
  'Delivered':        '#22C55E',
  'Cancelled':        '#EF4444',
}

interface BookingsByStatusProps {
  data: { status: string; count: number }[]
}

export function BookingsByStatus({ data }: BookingsByStatusProps) {
  const filtered = data.filter((d) => d.count > 0)

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={filtered}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="45%"
          outerRadius={90}
          innerRadius={50}
          paddingAngle={3}
        >
          {filtered.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_COLORS[entry.status] ?? '#6B7280'}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [String(value), 'Bookings']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
