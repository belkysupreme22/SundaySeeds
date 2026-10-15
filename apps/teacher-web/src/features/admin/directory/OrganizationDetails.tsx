import { useState } from "react";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Pencil,
  Plus,
  RotateCcw,
} from "lucide-react";
import { InputField } from "../../../shared/ui/InputField";
import type { DirectoryModel, DirectoryOrganization } from "./types";

export function OrganizationDetails({
  organization,
  model,
  onBack,
  onEdit,
  onCreateClass,
  onOpenClass,
}: {
  organization: DirectoryOrganization;
  model: DirectoryModel;
  onBack: () => void;
  onEdit: () => void;
  onCreateClass: () => void;
  onOpenClass: (id: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const classes = model.classes.filter(
    (item) => item.organizationId === organization.id,
  );
  const visible = classes.filter(
    (item) =>
      (!query.trim() ||
        `${item.name} ${item.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())) &&
      (status === "all" || (status === "archived") === item.archived),
  );
  function changeArchive() {
    const result = model.archiveOrganization(
      organization.id,
      !organization.archived,
    );
    setMessage(result.message);
    setError(!result.ok);
    if (result.ok) setConfirm(false);
  }
  return (
    <section className="admin-dir-stack">
      <button
        type="button"
        className="button button-outline admin-dir-back"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Organizations
      </button>
      <div className="admin-dir-surface admin-dir-stack tone-lavender">
        <div className="admin-dir-heading">
          <div>
            <p className="eyebrow">Organization workspace</p>
            <h2>{organization.name}</h2>
            <span className="admin-dir-status">
              {organization.archived ? "Archived" : "Active"}
            </span>
          </div>
          <div className="admin-dir-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={onEdit}
              disabled={organization.archived}
            >
              <Pencil size={16} />
              Edit brief
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={() => setConfirm(true)}
            >
              {organization.archived ? (
                <RotateCcw size={16} />
              ) : (
                <Archive size={16} />
              )}
              {organization.archived
                ? "Restore organization"
                : "Archive organization"}
            </button>
          </div>
        </div>
        <p>
          {organization.description ||
            "No organization purpose has been added."}
        </p>
        <p className="admin-dir-meta">
          {classes.length} {classes.length === 1 ? "class" : "classes"} ·{" "}
          {classes.filter((item) => !item.archived).length} active
        </p>
        {organization.archived && (
          <p className="admin-dir-note">
            This organization is archived. Class, membership and invitation
            changes are paused. Existing records remain available to read.
          </p>
        )}
        {confirm && (
          <div
            className="admin-dir-confirm"
            role="group"
            aria-label="Confirm organization archive status"
          >
            <h3>
              {organization.archived
                ? "Restore this organization?"
                : "Archive this organization?"}
            </h3>
            <p>
              {organization.archived
                ? "Classes keep their current status. Individually archived classes must be restored separately before changing their memberships or invitations."
                : "Classes, memberships and invitations are retained. New classes and class, membership and invitation changes will be paused until the organization is restored. No records or accounts are deleted."}
            </p>
            <div className="admin-dir-actions">
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
                onClick={changeArchive}
              >
                {organization.archived ? "Confirm restore" : "Confirm archive"}
              </button>
            </div>
          </div>
        )}
        {message && (
          <p
            role={error ? "alert" : "status"}
            className={error ? "admin-dir-error" : "admin-dir-note"}
          >
            {message}
          </p>
        )}
      </div>
      <div className="admin-dir-heading">
        <div>
          <p className="eyebrow">Within {organization.name}</p>
          <h3>Classes</h3>
        </div>
        <button
          className="button button-primary"
          type="button"
          disabled={organization.archived}
          onClick={onCreateClass}
        >
          <Plus size={16} />
          Create class
        </button>
      </div>
      <div className="admin-dir-filters">
        <label className="field">
          Search classes
          <InputField
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or purpose"
          />
        </label>
        <label className="field">
          Status
          <select
            className="input"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All classes</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>
      {visible.length ? (
        <div className="admin-dir-card-grid">
          {visible.map((item) => (
            <article className="admin-dir-card admin-dir-stack" key={item.id}>
              <div>
                <p className="admin-dir-scope">{organization.name}</p>
                <h3>{item.name}</h3>
                <span className="admin-dir-status">
                  {item.archived ? "Archived" : "Active"}
                </span>
              </div>
              <p>{item.description || "No purpose added yet."}</p>
              <p className="admin-dir-meta">
                {
                  model.memberships.filter(
                    (member) =>
                      member.classId === item.id && member.status === "active",
                  ).length
                }{" "}
                active memberships
              </p>
              <button
                type="button"
                className="button button-outline"
                onClick={() => onOpenClass(item.id)}
              >
                Open class
                <ArrowRight size={16} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-dir-empty">
          <h3>
            {classes.length
              ? "No classes match these filters"
              : "Begin with your first class"}
          </h3>
          <p>
            {classes.length
              ? "Try another name or status."
              : "Give an adult learning group a purpose, then bring existing people into its roster."}
          </p>
        </div>
      )}
    </section>
  );
}
