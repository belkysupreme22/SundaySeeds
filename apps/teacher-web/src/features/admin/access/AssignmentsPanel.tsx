import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { InputField } from "../../../shared/ui/InputField";
import type { DirectoryState } from "../directory/types";
import type { AccessModel } from "./types";
import { AssignmentReview } from "./AssignmentReview";
import { AssignmentDetails } from "./AssignmentDetails";

export function AssignmentsPanel({
  model,
  directory,
  onOpenRoles,
}: {
  model: AccessModel;
  directory: DirectoryState;
  onOpenRoles: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const selected = model.assignments.find((item) => item.id === selectedId);
  const filtered = model.assignments.filter((item) => {
    const person = directory.people.find(
      (person) => person.id === item.personId,
    );
    return (
      (status === "all" || item.status === status) &&
      `${person?.name ?? ""} ${person?.email ?? ""} ${item.snapshot.roleName} ${item.snapshot.scopeLabel}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
    );
  });
  if (creating)
    return (
      <AssignmentReview
        model={model}
        directory={directory}
        onBack={() => setCreating(false)}
        onRecorded={(id) => {
          setSelectedId(id);
          setCreating(false);
        }}
        onOpenRoles={onOpenRoles}
      />
    );
  if (selected)
    return (
      <AssignmentDetails
        key={selected.id}
        assignment={selected}
        model={model}
        directory={directory}
        onBack={() => setSelectedId(null)}
      />
    );
  return (
    <section className="access-stack">
      <header className="access-heading">
        <div>
          <p className="eyebrow">Assignment simulations</p>
          <h2>The person, the role and its boundary.</h2>
          <p className="muted">
            Review each proposal before recording a fixed snapshot. These
            records do not grant access.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={() => setCreating(true)}
        >
          <Plus size={17} aria-hidden="true" />
          Propose assignment
        </button>
      </header>
      <div className="access-surface access-filters">
        <label className="field">
          Find a proposal
          <InputField
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Person, role or scope"
          />
        </label>
        <label className="field">
          Simulation state
          <select
            className="input"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All states</option>
            <option value="simulated">Simulated assignments</option>
            <option value="revoked">Revoked simulations</option>
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="access-surface">
          <div
            className="table-wrap"
            tabIndex={0}
            role="region"
            aria-label="Assignment simulations, scroll horizontally if needed"
          >
            <table className="data-table">
              <caption>
                {filtered.length} assignment snapshots · no effective
                permissions
              </caption>
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">Role revision</th>
                  <th scope="col">Scope</th>
                  <th scope="col">State</th>
                  <th scope="col">Review</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <th scope="row">
                      {directory.people.find(
                        (person) => person.id === item.personId,
                      )?.name ?? "Person unavailable"}
                    </th>
                    <td>
                      {item.snapshot.roleName}
                      <small className="access-subtext">
                        Revision {item.snapshot.revision}
                      </small>
                    </td>
                    <td>{item.snapshot.scopeLabel}</td>
                    <td>
                      {item.status === "simulated" ? "Simulation" : "Revoked"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button button-outline"
                        onClick={() => setSelectedId(item.id)}
                      >
                        View snapshot
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="access-surface access-empty">
          <Users size={30} aria-hidden="true" />
          <h3>
            {model.assignments.length
              ? "No matching simulations"
              : "A responsibility should be deliberate."}
          </h3>
          <p className="muted">
            {model.assignments.length
              ? "Try a different person, role or state."
              : "Prepare a role proposal, choose an active directory person and review the exact scope and capabilities."}
          </p>
          {model.assignments.length ? (
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              className="button button-outline"
              onClick={onOpenRoles}
            >
              Open role proposals
            </button>
          )}
        </div>
      )}
    </section>
  );
}
