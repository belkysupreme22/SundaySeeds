import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ReportChartPoint {
  label: string;
  count: number;
}
export default function ReportChart({ data }: { data: ReportChartPoint[] }) {
  return (
    <div
      className="chart-frame"
      role="img"
      aria-label="Example count of lesson states. Exact values are in the adjacent chart values table."
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, bottom: 10, left: -22 }}
        >
          <CartesianGrid vertical={false} stroke="#DED9E5" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6D6777", fontSize: 11 }}
            interval={0}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6D6777", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ border: "1px solid #8F879A", borderRadius: 6 }}
          />
          <Bar
            name="Lesson states"
            dataKey="count"
            fill="#B9EBDD"
            stroke="#50465F"
            strokeWidth={1}
            radius={[4, 4, 0, 0]}
            maxBarSize={54}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
