import { useState, type FormEvent } from "react";
import type { DirectoryState } from "../directory/types";
import {
  capabilityLabels,
  type AccessCapability,
  type AccessModel,
} from "./types";
import { getScopeContext } from "./scope";

interface Review {
  roleId: string;
  personId: string;
  revision: number;
  roleName: string;
  personName: string;
  email: string;
  scopeLabel: string;
  capabilities: AccessCapability[];
}
export function AssignmentReview({
  model,
  directory,
  onBack,
  onRecorded,
  onOpenRoles,
}: {
  model: AccessModel;
  directory: DirectoryState;
  onBack: () => void;
  onRecorded: (id: string) => void;
  onOpenRoles: () => void;
}) {
  const [roleId, setRoleId] = useState("");
  const [personId, setPersonId] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState("");
  const role = model.roles.find((item) => item.id === roleId);
  const person = directory.people.find((item) => item.id === personId);
  const context = role ? getScopeContext(directory, role.scope) : null;
  const reviewRole = model.roles.find((item) => item.id === review?.roleId);
  const reviewPerson = directory.people.find(
    (item) => item.id === review?.personId,
  );
  const reviewScope = reviewRole
    ? getScopeContext(directory, reviewRole.scope)
    : null;
  const changed = Boolean(
    review && (!reviewRole || reviewRole.revision !== review.revision),
  );
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!role || !person || person.status !== "active" || !context?.available) {
      setError(
        "Choose an available role scope and an active directory person.",
      );
      return;
    }
    setReview({
      roleId: role.id,
      personId: person.id,
      revision: role.revision,
      roleName: role.name,
      personName: person.name,
      email: person.email,
      scopeLabel: context.label,
      capabilities: [...role.capabilities],
    });
    setError("");
  }
  function record() {
    if (!review) return;
    const result = model.recordAssignment(
      review.roleId,
      review.personId,
      review.revision,
    );
    if (result.ok && result.id) onRecorded(result.id);
    else setError(result.message);
  }
  return (
    <section className="access-surface access-stack">
      <header className="access-heading">
        <div>
          <p className="eyebrow">Assignment review</p>
          <h2>Give the responsibility a clear boundary.</h2>
          <p className="muted">
            Review a person, a scope and a fixed role revision. Recording this
            simulation changes no account or permission.
          </p>
        </div>
        <button
          className="button button-outline"
          type="button"
          onClick={onBack}
        >
          Cancel proposal
        </button>
      </header>
      {review ? (
        <>
          <dl className="access-summary">
            <div>
              <dt>Proposed administrator</dt>
              <dd>
                {review.personName}
                <small>{review.email}</small>
              </dd>
            </div>
            <div>
              <dt>Role proposal</dt>
              <dd>
                {review.roleName} · revision {review.revision}
              </dd>
            </div>
            <div>
              <dt>Scope</dt>
              <dd>{review.scopeLabel}</dd>
            </div>
          </dl>
          <section>
            <h3>Proposed responsibilities</h3>
            <ul className="access-capability-summary">
              {review.capabilities.map((capability) => (
                <li key={capability}>{capabilityLabels[capability]}</li>
              ))}
            </ul>
          </section>
          <p className="access-notice">
            No system-wide access, role delegation or sign-in account is added.
            Existing directory classifications and class memberships stay
            unchanged.
          </p>
          {changed && (
            <p className="access-error" role="alert">
              The role proposal changed. Review the latest revision before
              recording.
            </p>
          )}
          {!reviewScope?.available && (
            <p className="access-error" role="alert">
              {reviewScope?.reason ?? "The role scope is unavailable."}
            </p>
          )}
          {reviewPerson?.status !== "active" && (
            <p className="access-error" role="alert">
              This directory person is inactive or unavailable.
            </p>
          )}
          <div className="access-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setReview(null);
                setError("");
              }}
            >
              Review again
            </button>
            <button
              type="button"
              className="button button-primary"
              disabled={
                changed ||
                !reviewScope?.available ||
                reviewPerson?.status !== "active"
              }
              onClick={record}
            >
              Record assignment simulation
            </button>
          </div>
        </>
      ) : (
        <form className="access-form" onSubmit={prepare}>
          <label className="field">
            Role proposal
            <select
              className="input"
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
              required
            >
              <option value="">Choose a role proposal</option>
              {model.roles.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name} · revision {item.revision}
                </option>
              ))}
            </select>
          </label>
          {role && (
            <p
              className={
                context?.available ? "access-scope-label" : "access-error"
              }
            >
              {context?.label}
              {context?.available ? "" : " · " + context?.reason}
            </p>
          )}
          <label className="field">
            Person from the directory
            <select
              className="input"
              value={person?.status === "active" ? personId : ""}
              onChange={(event) => setPersonId(event.target.value)}
              required
            >
              <option value="">Choose an active directory record</option>
              {directory.people
                .filter((item) => item.status === "active")
                .map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name} · {item.email}
                  </option>
                ))}
            </select>
          </label>
          {!model.roles.length && (
            <div className="access-notice">
              <p>
                Prepare a scoped role proposal before reviewing an assignment.
              </p>
              <button
                type="button"
                className="button button-outline"
                onClick={onOpenRoles}
              >
                Open role proposals
              </button>
            </div>
          )}
          {!directory.people.some((item) => item.status === "active") && (
            <p className="access-notice">
              Create or explore active people in the administrator directory
              first.
            </p>
          )}
          <button
            type="submit"
            className="button button-primary"
            disabled={
              !role || person?.status !== "active" || !context?.available
            }
          >
            Review proposal
          </button>
        </form>
      )}
      {error && (
        <p className="access-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
