import { useId, useState } from "react";
import { LockKeyhole, RotateCcw, ShieldCheck, UserRound } from "lucide-react";

type Scenario = "two" | "last" | "bootstrap";
type ExampleAdministrator = "primary" | "backup";

const recoveryConsiderations = [
  {
    title: "Trusted first-administrator bootstrap",
    description:
      "Agree who can establish the first administrator, what trusted evidence is required, and how that one-time process is closed. No bootstrap method is configured.",
  },
  {
    title: "Separate backup access from account recovery",
    description:
      "An independently provisioned backup administrator and recovery of a locked account are different processes. Define eligibility and custody for each.",
  },
  {
    title: "Verify identity before recovery",
    description:
      "Choose a trusted identity-verification process and escalation owner. This screen cannot verify identity or restore access.",
  },
  {
    title: "Keep an auditable decision trail",
    description:
      "Define approvals, recorded evidence, notifications and audit retention for sensitive access changes and recovery attempts.",
  },
  {
    title: "Set delegation and enforcement rules",
    description:
      "Agree who can appoint or remove administrators and how scopes are enforced. Sub-admin proposals must never imply authority to grant system-wide access.",
  },
];

export function SafeguardWalkthrough() {
  const scenarioId = useId();
  const [scenario, setScenario] = useState<Scenario>("two");
  const [backupRemoved, setBackupRemoved] = useState(false);
  const [outcome, setOutcome] = useState("");

  const administrators: ExampleAdministrator[] =
    scenario === "bootstrap"
      ? []
      : scenario === "two" && !backupRemoved
        ? ["primary", "backup"]
        : ["primary"];

  function selectScenario(value: Scenario) {
    setScenario(value);
    setBackupRemoved(false);
    setOutcome("");
  }

  function simulateRemoval(administrator: ExampleAdministrator) {
    if (administrators.length <= 1) {
      setOutcome(
        "Blocked in this example: the last active super-admin must remain. Recovery and replacement need a separately agreed trusted process.",
      );
      return;
    }
    if (administrator === "primary") {
      setOutcome(
        "Blocked in this example: the current actor cannot remove their own super-admin access, even while a backup administrator remains.",
      );
      return;
    }
    setBackupRemoved(true);
    setOutcome(
      "Example backup removed from this walkthrough only. One example super-admin remains and is protected by the last-administrator rule.",
    );
  }

  return (
    <section
      className="panel access-safeguards"
      aria-labelledby={`${scenarioId}-heading`}
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Isolated example</p>
          <h3 id={`${scenarioId}-heading`}>Keep a trusted way in</h3>
          <p className="muted">
            Explore candidate safeguards for sensitive super-admin changes.
            These examples do not use directory records or change anyone’s
            access.
          </p>
        </div>
        <span className="admin-icon-tile tone-mint">
          <ShieldCheck size={24} aria-hidden="true" />
        </span>
      </div>

      <div className="access-safeguard-controls">
        <label className="field" htmlFor={`${scenarioId}-scenario`}>
          <span>Example scenario</span>
          <select
            id={`${scenarioId}-scenario`}
            className="input"
            value={scenario}
            onChange={(event) => selectScenario(event.target.value as Scenario)}
          >
            <option value="two">Two example super-admins</option>
            <option value="last">Last administrator</option>
            <option value="bootstrap">Bootstrap unavailable</option>
          </select>
        </label>
        <button
          type="button"
          className="button button-outline"
          onClick={() => {
            setBackupRemoved(false);
            setOutcome("This example scenario has been reset.");
          }}
        >
          <RotateCcw size={16} aria-hidden="true" /> Reset example
        </button>
      </div>

      <div className="access-safeguard-summary tone-lavender">
        <strong>
          {administrators.length} active example super-admin
          {administrators.length === 1 ? "" : "s"}
        </strong>
        <p>
          {scenario === "bootstrap"
            ? "No example actor is available. An unconfigured bootstrap process cannot be replaced by a screen button."
            : "Example primary is the current actor. Try a removal to see the proposed protection and its reason."}
        </p>
      </div>

      {administrators.length > 0 && (
        <ul
          className="access-safeguard-people"
          aria-label="Example super-admins"
        >
          {administrators.map((administrator) => (
            <li className="access-safeguard-person" key={administrator}>
              <span className="admin-icon-tile tone-yellow">
                <UserRound size={20} aria-hidden="true" />
              </span>
              <div>
                <strong>
                  {administrator === "primary"
                    ? "Example primary"
                    : "Example backup"}
                </strong>
                <p className="muted">
                  {administrator === "primary"
                    ? "Current actor · Example super-admin"
                    : "Separate example super-admin"}
                </p>
              </div>
              <button
                type="button"
                className="button button-outline"
                aria-label={`Simulate removal of example ${administrator}`}
                onClick={() => simulateRemoval(administrator)}
              >
                Simulate removal
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="access-safeguard-outcome" role="status" aria-live="polite">
        {outcome}
      </p>

      <details className="access-recovery-checklist">
        <summary>
          <LockKeyhole size={18} aria-hidden="true" />
          Recovery &amp; bootstrap considerations
        </summary>
        <p className="muted">
          Planning checklist · No recovery or bootstrap service is configured.
        </p>
        <ol>
          {recoveryConsiderations.map((consideration) => (
            <li key={consideration.title}>
              <strong>{consideration.title}</strong>
              <p className="muted">{consideration.description}</p>
            </li>
          ))}
        </ol>
      </details>

      <p className="access-safeguard-policy muted">
        Candidate safeguards only. Production policy, recovery ownership and
        delegation rules remain undecided. A trusted backend must enforce the
        agreed rules, including concurrent changes; this walkthrough provides no
        accounts, privileges or grant authority.
      </p>
    </section>
  );
}
