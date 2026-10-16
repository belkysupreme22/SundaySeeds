import { useState } from "react";
import { Mail, Plus } from "lucide-react";
import { InputField } from "../../../shared/ui/InputField";
import { InvitationForm } from "./InvitationForm";
import { InvitationDetails } from "./InvitationDetails";
import {
  directoryRoleLabels,
  type DirectoryInvitation,
  type DirectoryModel,
  type DirectoryRole,
} from "./types";

export function InvitationsPanel({
  model,
  onOpenOrganizations,
  defaultRole = "learner",
  defaultClassId = "",
}: {
  model: DirectoryModel;
  onOpenOrganizations: () => void;
  defaultRole?: DirectoryRole;
  defaultClassId?: string;
}) {
  const [query, setQuery] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [classId, setClassId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const selected = model.invitations.find((item) => item.id === selectedId);
  const scopedClasses = model.classes.filter(
    (item) => !organizationId || item.organizationId === organizationId,
  );
  function scope(invitation: DirectoryInvitation) {
    const group = model.classes.find((item) => item.id === invitation.classId);
    const organization = model.organizations.find(
      (item) => item.id === group?.organizationId,
    );
    return {
      group,
      organization,
      title: `${organization?.name ?? "Organization unavailable"} / ${group?.name ?? "Class unavailable"}`,
      closed:
        !group || group.archived || !organization || organization.archived,
    };
  }
  const filtered = model.invitations.filter((item) => {
    const context = scope(item);
    return (
      (!organizationId || context.organization?.id === organizationId) &&
      (!classId || item.classId === classId) &&
      (statusFilter === "all" || item.status === statusFilter) &&
      `${item.name} ${item.email}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
    );
  });
  if (creating)
    return (
      <InvitationForm
        defaultRole={defaultRole}
        defaultClassId={defaultClassId}
        model={model}
        onClose={() => setCreating(false)}
        onCreated={(id) => {
          setCreating(false);
          setSelectedId(id);
          setFeedback(
            "Invitation prepared in the simulation. No email was sent.",
          );
        }}
      />
    );
  if (selected)
    return (
      <InvitationDetails
        key={selected.id}
        model={model}
        selected={selected}
        onBack={() => setSelectedId(null)}
        initialFeedback={feedback}
      />
    );
  return (
    <section className="admin-dir-stack">
      <header className="admin-dir-heading">
        <div>
          <p className="eyebrow">A clear invitation</p>
          <h2>People, purpose and the right class.</h2>
          <p className="muted">
            Review class-scoped invitation states. These records do not deliver
            messages or grant access.
          </p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => {
            setCreating(true);
          }}
        >
          <Plus size={17} aria-hidden="true" />
          Prepare invitation
        </button>
      </header>
      <div className="admin-dir-surface admin-dir-filters">
        <label className="field">
          Find an invitation
          <InputField
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or example email"
          />
        </label>
        <label className="field">
          Organization
          <select
            className="input"
            value={organizationId}
            onChange={(event) => {
              setOrganizationId(event.target.value);
              setClassId("");
            }}
          >
            <option value="">All organizations</option>
            {model.organizations.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
                {item.archived ? " · Archived" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Class
          <select
            className="input"
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
          >
            <option value="">All classes</option>
            {scopedClasses.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
                {item.archived ? " · Archived" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Status
          <select
            className="input"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {["all", "pending", "accepted", "expired", "revoked"].map(
              (value) => (
                <option key={value} value={value}>
                  {value === "all"
                    ? "All states"
                    : value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ),
            )}
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="admin-dir-surface">
          <div
            className="table-wrap"
            tabIndex={0}
            role="region"
            aria-label="Invitation directory, scroll horizontally if needed"
          >
            <table className="data-table">
              <caption>
                {filtered.length} simulated invitations · explicit organization
                and class scope
              </caption>
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">Participation</th>
                  <th scope="col">Organization / class</th>
                  <th scope="col">State</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <th scope="row">
                      {item.name}
                      <small className="admin-dir-subtext">{item.email}</small>
                    </th>
                    <td>{directoryRoleLabels[item.role]}</td>
                    <td>{scope(item).title}</td>
                    <td>
                      <span className="badge">{item.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button button-outline"
                        onClick={() => {
                          setSelectedId(item.id);
                          setFeedback("");
                        }}
                      >
                        View invitation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="admin-dir-surface admin-dir-empty">
          <Mail size={32} aria-hidden="true" />
          <h3>
            {model.invitations.length
              ? "No invitations match this view"
              : "A welcoming start, with a clear scope."}
          </h3>
          <p className="muted">
            {model.invitations.length
              ? "Try another person, organization, class or status."
              : "Create an organization and class, then prepare an invitation. Or explore the shared example workspace."}
          </p>
          <div className="admin-dir-actions">
            {model.invitations.length ? (
              <button
                type="button"
                className="button button-outline"
                onClick={() => {
                  setQuery("");
                  setOrganizationId("");
                  setClassId("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={onOpenOrganizations}
                >
                  Open organizations
                </button>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={model.loadExamples}
                >
                  Explore example workspace
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <p className="admin-dir-status" role="status">
        {feedback}
      </p>
    </section>
  );
}
