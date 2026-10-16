import { useState } from "react";
import { History, Search } from "lucide-react";
import { AuditFilters } from "./AuditFilters";
import { AuditEventDetails } from "./AuditEventDetails";
import {
  auditExampleEvents,
  emptyAuditFilters,
  exampleTime,
  outcomeLabels,
  type AuditFiltersValue,
} from "./auditExamples";

export function AuditLog() {
  const [example, setExample] = useState(false);
  const [filters, setFilters] = useState<AuditFiltersValue>({
    ...emptyAuditFilters,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [presentation, setPresentation] = useState("ready");
  const selected = auditExampleEvents.find((event) => event.id === selectedId);
  const invalidRange = Boolean(
    filters.from && filters.to && filters.from > filters.to,
  );
  const query = filters.query.trim().toLowerCase();
  const filtered = auditExampleEvents.filter((event) => {
    const date = event.time.slice(0, 10);
    return (
      (!filters.organization || event.organization === filters.organization) &&
      (!filters.category || event.category === filters.category) &&
      (!filters.outcome || event.outcome === filters.outcome) &&
      (!filters.from || date >= filters.from) &&
      (!filters.to || date <= filters.to) &&
      `${event.actor} ${event.action} ${event.target} ${event.targetId} ${event.id} ${event.requestReference} ${event.className ?? ""}`
        .toLowerCase()
        .includes(query)
    );
  });
  if (!example)
    return (
      <section className="audit-surface audit-empty">
        <span className="admin-icon-tile tone-lavender">
          <History size={25} aria-hidden="true" />
        </span>
        <h3>A clear record needs a trusted source.</h3>
        <p className="muted">
          Audit history is unavailable. No authenticated audit source or
          authorized event reader is connected, and prototype changes are not
          recorded as real system events.
        </p>
        <button
          type="button"
          className="button button-primary"
          onClick={() => setExample(true)}
        >
          Explore example audit log
        </button>
      </section>
    );
  if (selected)
    return (
      <AuditEventDetails event={selected} onBack={() => setSelectedId(null)} />
    );
  return (
    <section className="audit-stack">
      <div className="audit-example-note">
        <div>
          <span className="badge tone-yellow">Example audit log</span>
          <p>
            Fixed fictional events from 1–2 October 2026, shown in UTC. They are
            independent of actions in this prototype.
          </p>
        </div>
        <button
          type="button"
          className="button button-outline"
          onClick={() => setExample(false)}
        >
          Close example
        </button>
      </div>
      <AuditFilters value={filters} onChange={setFilters} />
      {invalidRange ? (
        <p className="audit-error" role="alert">
          Choose an end date on or after the start date. The example list is
          paused until the range is valid.
        </p>
      ) : presentation !== "ready" ? (
        <section className="audit-surface audit-empty">
          <h3>
            {presentation === "loading"
              ? "Loading audit history · design example"
              : "Audit history unavailable · design example"}
          </h3>
          <p className="muted">
            {presentation === "loading"
              ? "This shows the waiting presentation. No request is running."
              : "This shows a recoverable read failure. It does not indicate a real incident, and existing prototype work is unchanged."}
          </p>
          <button
            type="button"
            className="button button-outline"
            onClick={() => setPresentation("ready")}
          >
            Return to example list
          </button>
        </section>
      ) : filtered.length ? (
        <section className="audit-surface">
          <div
            className="table-wrap"
            tabIndex={0}
            role="region"
            aria-label="Example audit events, scroll horizontally if needed"
          >
            <table className="data-table">
              <caption>
                {filtered.length} of {auditExampleEvents.length} fictional
                events · newest first · UTC
              </caption>
              <thead>
                <tr>
                  <th scope="col">Example time</th>
                  <th scope="col">Actor / action</th>
                  <th scope="col">Scope / target</th>
                  <th scope="col">Outcome</th>
                  <th scope="col">Detail</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event) => (
                  <tr key={event.id}>
                    <td>
                      {exampleTime(event.time)}
                      <small className="audit-subtext">{event.id}</small>
                    </td>
                    <th scope="row">
                      {event.action}
                      <small className="audit-subtext">{event.actor}</small>
                    </th>
                    <td>
                      {event.organization}
                      <small className="audit-subtext">
                        {event.className ?? "Organization scope"} ·{" "}
                        {event.target}
                      </small>
                    </td>
                    <td>
                      <span
                        className={`audit-outcome audit-outcome-${event.outcome}`}
                      >
                        {outcomeLabels[event.outcome]}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button button-outline"
                        onClick={() => setSelectedId(event.id)}
                      >
                        View event
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="audit-surface audit-empty">
          <Search size={28} aria-hidden="true" />
          <h3>No example events match these filters.</h3>
          <p className="muted">
            Try another scope, actor, outcome or date range.
          </p>
          <button
            type="button"
            className="button button-outline"
            onClick={() => setFilters({ ...emptyAuditFilters })}
          >
            Clear filters
          </button>
        </div>
      )}
      <details className="audit-state-controls">
        <summary>Screen state examples</summary>
        <label className="field">
          Example list presentation
          <select
            className="input"
            value={presentation}
            onChange={(event) => setPresentation(event.target.value)}
          >
            <option value="ready">Current example list</option>
            <option value="loading">Loading presentation</option>
            <option value="error">Read error presentation</option>
          </select>
        </label>
        <p className="muted">
          Presentation only. Returning to the list does not retry a service.
        </p>
      </details>
    </section>
  );
}
