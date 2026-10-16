import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import {
  exampleTime,
  outcomeLabels,
  type AuditExampleEvent,
} from "./auditExamples";

export function AuditEventDetails({
  event,
  onBack,
}: {
  event: AuditExampleEvent;
  onBack: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [event.id]);
  return (
    <section className="audit-stack">
      <button
        type="button"
        className="button button-outline audit-back"
        onClick={onBack}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to example events
      </button>
      <header className="audit-surface audit-heading">
        <div>
          <p className="eyebrow">Fictional event · {event.id}</p>
          <h2 tabIndex={-1} ref={heading}>
            {event.action}
          </h2>
          <p>{exampleTime(event.time)}</p>
        </div>
        <span className={`audit-outcome audit-outcome-${event.outcome}`}>
          {outcomeLabels[event.outcome]} · example
        </span>
      </header>
      <section className="audit-surface audit-stack">
        <dl className="audit-metadata">
          <div>
            <dt>Example actor</dt>
            <dd>{event.actor}</dd>
          </div>
          <div>
            <dt>Organization</dt>
            <dd>{event.organization}</dd>
          </div>
          <div>
            <dt>Class scope</dt>
            <dd>{event.className ?? "Organization scope"}</dd>
          </div>
          <div>
            <dt>Target</dt>
            <dd>
              {event.target}
              <small>{event.targetId}</small>
            </dd>
          </div>
          <div>
            <dt>Request reference</dt>
            <dd>{event.requestReference}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>Fixed example dataset · no connected audit service</dd>
          </div>
        </dl>
        <div className="audit-note">
          <h3>Outcome context</h3>
          <p>{event.summary}</p>
        </div>
        {event.changes.length ? (
          <div
            className="table-wrap"
            tabIndex={0}
            role="region"
            aria-label="Example acknowledged field changes"
          >
            <table className="data-table">
              <caption>
                Illustrative acknowledged changes; no actual record was modified
              </caption>
              <thead>
                <tr>
                  <th scope="col">Field</th>
                  <th scope="col">Before</th>
                  <th scope="col">After</th>
                </tr>
              </thead>
              <tbody>
                {event.changes.map((change) => (
                  <tr key={change.field}>
                    <th scope="row">{change.field}</th>
                    <td>{change.before}</td>
                    <td>{change.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">
            No acknowledged changes are recorded in this example. A denied or
            failed request is not a successful mutation.
          </p>
        )}
        <p className="muted">
          These records do not come from your directory, settings, role
          proposals or teacher activity. Audit access and retention rules remain
          to be agreed before connecting a trusted source.
        </p>
      </section>
    </section>
  );
}
