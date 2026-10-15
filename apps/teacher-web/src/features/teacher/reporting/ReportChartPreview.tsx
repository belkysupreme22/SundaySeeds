import { Component, lazy, Suspense, useState, type ReactNode } from "react";
import { BarChart3 } from "lucide-react";
import type { ReportChartPoint } from "./ReportChart";

const ReportChart = lazy(() => import("./ReportChart"));
class ChartBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p role="alert">
        The chart could not load. The values table below remains available.
      </p>
    ) : (
      this.props.children
    );
  }
}
export function ReportChartPreview({ data }: { data: ReportChartPoint[] }) {
  const [shown, setShown] = useState(false);
  return (
    <section className="report-surface" aria-labelledby="report-chart-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Progress snapshot</p>
          <h3 id="report-chart-heading">Room to keep growing</h3>
        </div>
        <BarChart3 size={21} aria-hidden="true" />
      </div>
      <p className="muted report-chart-copy">
        Example lesson-state counts, including unavailable records. This is a
        snapshot, not a trend over time.
      </p>
      {shown && (
        <ChartBoundary>
          <Suspense fallback={<p role="status">Loading example chart…</p>}>
            <ReportChart data={data} />
          </Suspense>
        </ChartBoundary>
      )}
      <button
        type="button"
        className="button button-outline"
        onClick={() => setShown((value) => !value)}
      >
        {shown ? "Hide chart" : "Show example chart"}
      </button>
      <div className="table-wrap">
        <table className="data-table report-chart-table">
          <caption>Exact chart values · example only</caption>
          <thead>
            <tr>
              <th scope="col">Lesson state</th>
              <th scope="col">Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.label}>
                <th scope="row">{point.label}</th>
                <td>{point.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
