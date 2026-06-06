"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface FieldCompletionRate {
  fieldId: string;
  label: string;
  completionRate: number;
}

interface CompletionChartProps {
  data: FieldCompletionRate[];
}

function truncateLabel(label: string) {
  return label.length > 24 ? `${label.slice(0, 21)}...` : label;
}

export function CompletionChart({ data }: CompletionChartProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="h-72 text-slate-950 dark:text-gray-100">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 8, right: 24 }}
        >
          <CartesianGrid horizontal={false} stroke="currentColor" opacity={0.12} />
          <XAxis
            type="number"
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={148}
            axisLine={false}
            tickLine={false}
            tickFormatter={(label) => truncateLabel(String(label))}
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            formatter={(value) => [`${value}%`, "Completion"]}
          />
          <Bar
            dataKey="completionRate"
            fill="currentColor"
            radius={[0, 4, 4, 0]}
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
