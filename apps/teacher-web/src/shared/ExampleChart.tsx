import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const activity = [
  { label: "Week 1", value: 4 },
  { label: "Week 2", value: 7 },
  { label: "Week 3", value: 5 },
  { label: "Week 4", value: 10 },
];
const completion = [
  { label: "Not started", value: 5 },
  { label: "Reading", value: 8 },
  { label: "Finished", value: 12 },
];

export default function ExampleChart({
  kind,
}: {
  kind: "activity" | "completion";
}) {
  const data = kind === "activity" ? activity : completion;
  return (
    <figure className="chart-figure">
      <div
        className="chart-frame"
        role="img"
        aria-label="Illustrative chart. Values are listed in the table below."
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          {kind === "activity" ? (
            <AreaChart
              data={data}
              margin={{ top: 16, right: 16, bottom: 8, left: -16 }}
            >
              <CartesianGrid vertical={false} stroke="#DED9E5" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6D6777", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6D6777", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ border: "1px solid #19171D", borderRadius: 6 }}
              />
              <Area
                name="Example completions"
                type="linear"
                dataKey="value"
                stroke="#7962B3"
                strokeWidth={2}
                fill="#DCD3FA"
                fillOpacity={0.55}
                dot={{
                  r: 4,
                  fill: "#CBBBF4",
                  stroke: "#19171D",
                  strokeWidth: 1,
                }}
                isAnimationActive={false}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 16, right: 16, bottom: 8, left: -16 }}
            >
              <CartesianGrid vertical={false} stroke="#DED9E5" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6D6777", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6D6777", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ border: "1px solid #19171D", borderRadius: 6 }}
              />
              <Bar
                name="Example learners"
                dataKey="value"
                fill="#B9EBDD"
                stroke="#19171D"
                strokeWidth={1}
                radius={[5, 5, 0, 0]}
                maxBarSize={54}
                isAnimationActive={false}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <figcaption>
        Design sample ·{" "}
        {kind === "activity" ? "Weekly completions" : "Learner stages"}
      </figcaption>
      <details>
        <summary>View example values</summary>
        <table className="data-table">
          <caption>Illustrative values only</caption>
          <thead>
            <tr>
              <th scope="col">{kind === "activity" ? "Week" : "Stage"}</th>
              <th scope="col">Example count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.label}>
                <th scope="row">{point.label}</th>
                <td>{point.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
