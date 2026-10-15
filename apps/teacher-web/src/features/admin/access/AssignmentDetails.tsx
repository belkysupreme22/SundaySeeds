import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { DirectoryState } from "../directory/types";
import {
  capabilityLabels,
  type AccessAssignment,
  type AccessModel,
} from "./types";
import { getScopeContext } from "./scope";

export function AssignmentDetails({
  assignment,
  model,
  directory,
  onBack,
}: {
  assignment: AccessAssignment;
  model: AccessModel;
  directory: DirectoryState;
  onBack: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const person = directory.people.find(
    (item) => item.id === assignment.personId,
  );
  const role = model.roles.find((item) => item.id === assignment.roleId);
  const context = getScopeContext(directory, assignment.snapshot.scope);
  function revoke() {
    const result = model.revokeAssignment(assignment.id);
    setMessage(result.message);
    setError(!result.ok);
    if (result.ok) setConfirm(false);
  }
  return (
    <section className="access-stack">
      <button
        type="button"
        className="button button-outline access-back"
        onClick={onBack}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        All assignment simulations
      </button>
      <header className="access-surface access-heading">
        <div>
          <p className="eyebrow">Saved simulation snapshot</p>
          <h2>{person?.name ?? "Directory person unavailable"}</h2>
          <p className="muted">{person?.email}</p>
        </div>
        <span className="badge">
          {assignment.status === "simulated"
            ? "Simulated assignment"
            : "Revoked simulation"}
        </span>
      </header>
      <section className="access-surface access-stack">
        <dl className="access-summary">
          <div>
            <dt>Role snapshot</dt>
            <dd>
              {assignment.snapshot.roleName} · revision{" "}
              {assignment.snapshot.revision}
            </dd>
          </div>
          <div>
            <dt>Recorded scope</dt>
            <dd>{assignment.snapshot.scopeLabel}</dd>
          </div>
          <div>
            <dt>Current scope</dt>
            <dd>
              {context.label}
              {!context.available && <small>{context.reason}</small>}
            </dd>
          </div>
        </dl>
        <ul className="access-capability-summary">
          {assignment.snapshot.capabilities.map((capability) => (
            <li key={capability}>{capabilityLabels[capability]}</li>
          ))}
        </ul>
        {role && role.revision !== assignment.snapshot.revision && (
          <p className="access-notice">
            The role proposal is now revision {role.revision}. This assignment
            keeps its recorded revision {assignment.snapshot.revision}; it has
            not inherited later edits.
          </p>
        )}
        {person?.status !== "active" && (
          <p className="access-notice">
            The directory record is inactive or unavailable. This saved
            simulation does not establish effective access.
          </p>
        )}
        <p className="muted">
          This record is not a permission grant. Production authority and
          delegation rules remain unconfigured.
        </p>
        {assignment.status === "simulated" ? (
          <button
            type="button"
            className="button button-outline access-back"
            onClick={() => setConfirm(true)}
          >
            Review revocation
          </button>
        ) : (
          <p className="access-notice">
            The simulation is revoked and its snapshot is retained. A new
            proposal requires a fresh review.
          </p>
        )}
        {confirm && assignment.status === "simulated" && (
          <div
            className="access-unsaved"
            role="group"
            aria-label="Confirm simulated assignment revocation"
          >
            <strong>Revoke this assignment simulation?</strong>
            <p>
              The saved snapshot remains visible. No account, class membership
              or real permission changes.
            </p>
            <div className="access-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => setConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={revoke}
              >
                Revoke simulation
              </button>
            </div>
          </div>
        )}
        {message && (
          <p
            className={error ? "access-error" : "access-status"}
            role={error ? "alert" : "status"}
          >
            {message}
          </p>
        )}
      </section>
    </section>
  );
}
