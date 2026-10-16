import { useState } from "react";
import { CloudOff, LifeBuoy } from "lucide-react";

const services = [
  {
    name: "Accounts & access",
    detail: "No sign-in provider or trusted permission service is connected.",
  },
  {
    name: "Invitation delivery",
    detail:
      "No delivery provider, queue acknowledgement or delivery history is available.",
  },
  {
    name: "Content & media",
    detail:
      "No remote draft, publication or file-storage service is connected.",
  },
  {
    name: "Audit history",
    detail:
      "No authoritative event source, reader authorization or retention policy is configured.",
  },
];
const scenarios = {
  invitation: {
    label: "Invitation delivery delayed",
    title: "A prepared invitation is not proof of delivery.",
    summary:
      "An illustrative invitation exists, but the delivery provider has not acknowledged delivery. This does not describe an actual queue or message.",
    steps: [
      "Keep prepared, delivered and accepted states distinct.",
      "Check the delivery acknowledgement before telling a learner that an invitation arrived.",
      "A connected retry needs a stable operation reference so an uncertain request does not produce duplicate invitations.",
    ],
  },
  publication: {
    label: "Publication result uncertain",
    title: "Keep the last acknowledged release clear.",
    summary:
      "An illustrative publication request has no confirmed result. Neither success nor rollback can be assumed from a missing acknowledgement.",
    steps: [
      "Preserve the working draft and identify the last acknowledged version.",
      "Resolve the original request outcome before repeating publication.",
      "Show a recoverable pending or uncertain state; do not silently replace a published version.",
    ],
  },
  audit: {
    label: "Audit history unavailable",
    title: "Unavailable history is different from no activity.",
    summary:
      "An illustrative audit read fails. It cannot establish whether privileged actions occurred, nor whether a separate write was accepted.",
    steps: [
      "Keep unavailable history separate from a genuine empty result.",
      "Provide an authorized recovery path without claiming that a read retry repaired any mutation.",
      "Agree who may read events and how sensitive actions behave when audit recording is unavailable before the connected pilot.",
    ],
  },
};
type Scenario = keyof typeof scenarios;

export function OperationsPanel() {
  const [example, setExample] = useState(false);
  const [scenario, setScenario] = useState<Scenario>("invitation");
  const selected = scenarios[scenario];
  return (
    <section className="audit-stack">
      <header className="audit-heading">
        <div>
          <p className="eyebrow">Service availability</p>
          <h2>Know what has been acknowledged.</h2>
          <p className="muted">
            No monitoring source is connected. These rows describe availability,
            not measured health, uptime or a service check.
          </p>
        </div>
        <span className="admin-icon-tile tone-mint">
          <CloudOff size={24} aria-hidden="true" />
        </span>
      </header>
      <div className="audit-service-grid">
        {services.map((service) => (
          <article
            className="audit-surface audit-service-card"
            key={service.name}
          >
            <span className="badge">Not connected</span>
            <h3>{service.name}</h3>
            <p className="muted">{service.detail}</p>
            <small>No check performed</small>
          </article>
        ))}
      </div>
      <section className="audit-surface audit-stack">
        <div className="audit-heading">
          <div>
            <p className="eyebrow">Recovery presentation</p>
            <h3>A little context before trying again.</h3>
          </div>
          <LifeBuoy size={24} aria-hidden="true" />
        </div>
        <p className="muted">
          Explore fixed examples of uncertain outcomes. No checks, retries,
          messages, restores or privileged operations run here.
        </p>
        <button
          type="button"
          className="button button-outline audit-back"
          onClick={() => setExample((current) => !current)}
        >
          {example ? "Hide recovery examples" : "Explore recovery examples"}
        </button>
        {example && (
          <div className="audit-stack">
            <label className="field">
              Example scenario
              <select
                className="input"
                value={scenario}
                onChange={(event) =>
                  setScenario(event.target.value as Scenario)
                }
              >
                {Object.entries(scenarios).map(([key, value]) => (
                  <option value={key} key={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="audit-example-note">
              <div>
                <span className="badge tone-yellow">Recovery example</span>
                <h3>{selected.title}</h3>
                <p>{selected.summary}</p>
              </div>
            </div>
            <ol className="audit-recovery-steps">
              {selected.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="audit-note">
              These are design considerations, not an approved incident
              procedure. Provider acknowledgements, retry rules and operational
              ownership still need agreement.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}
