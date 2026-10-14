import { Component, lazy, Suspense, useState, type ReactNode } from "react";
import { BarChart3, RotateCcw } from "lucide-react";

const ExampleChart = lazy(() => import("./ExampleChart"));

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
        The chart could not load. Refresh the page to try again.
      </p>
    ) : (
      this.props.children
    );
  }
}

export function ChartPreview({
  kind = "activity",
}: {
  kind?: "activity" | "completion";
}) {
  const [show, setShow] = useState(false);
  return (
    <section
      className="panel chart-preview"
      aria-label="Illustrative chart design"
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow">CHART DESIGN</p>
          <h2>
            {kind === "activity"
              ? "Learning over time"
              : "A picture of progress"}
          </h2>
        </div>
        <span className="badge">Example only</span>
      </div>
      {show ? (
        <>
          <p className="muted">
            Illustrative values for reviewing the chart style. These are not
            learner results.
          </p>
          <ChartBoundary>
            <Suspense fallback={<p role="status">Loading chart example…</p>}>
              <ExampleChart kind={kind} />
            </Suspense>
          </ChartBoundary>
          <button
            className="button button-outline"
            onClick={() => setShow(false)}
          >
            <RotateCcw size={16} />
            Hide example
          </button>
        </>
      ) : (
        <div className="chart-placeholder">
          <BarChart3 size={34} />
          <h3>Give progress a clear shape.</h3>
          <p className="muted">
            Review the pastel chart treatment with illustrative data.
          </p>
          <button
            className="button button-primary"
            onClick={() => setShow(true)}
          >
            Show chart example
          </button>
        </div>
      )}
    </section>
  );
}
