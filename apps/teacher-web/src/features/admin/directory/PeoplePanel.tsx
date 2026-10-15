import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { InputField } from "../../../shared/ui/InputField";
import { PersonEditor } from "./PersonEditor";
import { PersonDetails } from "./PersonDetails";
import { directoryRoleLabels, type DirectoryModel } from "./types";

export function PeoplePanel({ model }: { model: DirectoryModel }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [organizationId, setOrganizationId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const selected = model.people.find((item) => item.id === selectedId);
  const filtered = model.people.filter((person) => {
    const inOrganization =
      !organizationId ||
      model.memberships.some(
        (member) =>
          member.personId === person.id &&
          model.classes.some(
            (group) =>
              group.id === member.classId &&
              group.organizationId === organizationId,
          ),
      );
    return (
      inOrganization &&
      (role === "all" || person.role === role) &&
      (status === "all" || person.status === status) &&
      `${person.name} ${person.email}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
    );
  });
  if (editing)
    return (
      <PersonEditor
        key={selected?.id ?? "new"}
        model={model}
        item={selected}
        onClose={() => setEditing(false)}
        onSaved={(id) => {
          setSelectedId(id);
          setEditing(false);
        }}
      />
    );
  if (selected)
    return (
      <PersonDetails
        key={selected.id}
        model={model}
        person={selected}
        onBack={() => setSelectedId(null)}
        onEdit={() => setEditing(true)}
      />
    );
  return (
    <section className="admin-dir-stack">
      <header className="admin-dir-heading">
        <div>
          <p className="eyebrow">Learn · teach · belong</p>
          <h2>The people behind the learning.</h2>
          <p className="muted">
            Adult learners and teachers, with their organization and class scope
            in view.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={() => {
            setSelectedId(null);
            setEditing(true);
          }}
        >
          <Plus size={17} aria-hidden="true" />
          Create directory record
        </button>
      </header>
      <div className="admin-dir-surface admin-dir-filters">
        <label className="field">
          Find a person
          <InputField
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or example email"
          />
        </label>
        <label className="field">
          Classification
          <select
            className="input"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="all">Everyone</option>
            {Object.entries(directoryRoleLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Record status
          <select
            className="input"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All states</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label className="field">
          Organization scope
          <select
            className="input"
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
          >
            <option value="">All organizations</option>
            {model.organizations.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
                {item.archived ? " · Archived" : ""}
              </option>
            ))}
          </select>
          <span className="muted">
            Includes active and removed membership records.
          </span>
        </label>
      </div>
      {filtered.length ? (
        <div className="admin-dir-surface">
          <div
            className="table-wrap"
            tabIndex={0}
            role="region"
            aria-label="People directory, scroll horizontally if needed"
          >
            <table className="data-table">
              <caption>
                {filtered.length} simulated directory records · classifications
                do not grant access
              </caption>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Classification</th>
                  <th scope="col">Organization / class scope</th>
                  <th scope="col">Record state</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((person) => (
                  <tr key={person.id}>
                    <th scope="row">
                      {person.name}
                      <small className="admin-dir-subtext">
                        {person.email}
                      </small>
                    </th>
                    <td>{directoryRoleLabels[person.role]}</td>
                    <td>
                      {model.memberships.some(
                        (member) => member.personId === person.id,
                      ) ? (
                        <ul className="admin-dir-scope-list">
                          {model.memberships
                            .filter((member) => member.personId === person.id)
                            .map((member) => {
                              const group = model.classes.find(
                                (item) => item.id === member.classId,
                              );
                              const org = model.organizations.find(
                                (item) => item.id === group?.organizationId,
                              );
                              return (
                                <li key={member.id}>
                                  {org?.name ?? "Organization unavailable"} /{" "}
                                  {group?.name ?? "Class unavailable"}
                                  <small className="admin-dir-subtext">
                                    {directoryRoleLabels[member.role]} ·{" "}
                                    {member.status}
                                    {org?.archived || group?.archived
                                      ? " · Archived scope"
                                      : ""}
                                  </small>
                                </li>
                              );
                            })}
                        </ul>
                      ) : (
                        "No class scope assigned"
                      )}
                    </td>
                    <td>
                      <span className="badge">{person.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button button-outline"
                        onClick={() => setSelectedId(person.id)}
                      >
                        View person
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
          <Users size={32} aria-hidden="true" />
          <h3>
            {model.people.length
              ? "No people match this view"
              : "Make room for the people who learn and teach."}
          </h3>
          <p className="muted">
            {model.people.length
              ? "Try another name, classification, status or organization."
              : "Create a directory record or explore the shared example workspace. No sign-in accounts are connected."}
          </p>
          {model.people.length ? (
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setQuery("");
                setRole("all");
                setStatus("all");
                setOrganizationId("");
              }}
            >
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              className="button button-outline"
              onClick={model.loadExamples}
            >
              Explore example workspace
            </button>
          )}
        </div>
      )}
      <p className="admin-dir-note">
        Administrator capabilities and system-wide or delegated role grants
        remain in the Access &amp; roles plan.
      </p>
    </section>
  );
}
