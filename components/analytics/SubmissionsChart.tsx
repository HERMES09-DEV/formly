"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SubmissionsPerDay {
  date: string;
  count: number;
}

interface SubmissionsChartProps {
  data: SubmissionsPerDay[];
}

interface ChartPoint extends SubmissionsPerDay {
  label: string;
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatTooltipLabel(label: string, data: ChartPoint[]) {
  return data.find((point) => point.label === label)?.label ?? label;
}

export function SubmissionsChart({ data }: SubmissionsChartProps) {
  const chartData: ChartPoint[] = data.map((point) => ({
    ...point,
    label: formatDateLabel(point.date),
  }));

  return (
    <div className="h-72 text-slate-950 dark:text-gray-100">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ left: 0, right: 12 }}>
          <CartesianGrid vertical={false} stroke="currentColor" opacity={0.12} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            minTickGap={20}
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            width={32}
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ stroke: "#cbd5e1" }}
            labelFormatter={(label) =>
              formatTooltipLabel(String(label), chartData)
            }
            formatter={(value) => [value, "Submissions"]}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="currentColor"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
