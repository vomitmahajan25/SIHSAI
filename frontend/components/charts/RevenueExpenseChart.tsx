'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ChartDataPoint {
  month_name: string;
  revenue: number;
  expenses: number;
  net_profit: number;
}

interface ChartProps {
  data: ChartDataPoint[];
}

export default function RevenueExpenseChart({ data }: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-ink-secondary text-sm">
        No transaction records found to graph for this timeframe.
      </div>
    );
  }

  const formatYAxis = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE5DA" vertical={false} />
          <XAxis
            dataKey="month_name"
            tick={{ fill: '#64716A', fontSize: 11 }}
            axisLine={{ stroke: '#DDE5DA' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fill: '#64716A', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #DDE5DA',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="circle"
          />
          <Bar dataKey="revenue" name="Revenue" fill="#287A50" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#C2413B" radius={[4, 4, 0, 0]} />
          <Bar dataKey="net_profit" name="Net Profit" fill="#102B25" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
