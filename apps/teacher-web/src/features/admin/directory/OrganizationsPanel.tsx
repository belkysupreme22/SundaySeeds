import { useState } from "react";
import { ArrowRight, Building2, Plus } from "lucide-react";
import { InputField } from "../../../shared/ui/InputField";
import { OrganizationEditor } from "./OrganizationEditor";
import { ClassEditor } from "./ClassEditor";
import { OrganizationDetails } from "./OrganizationDetails";
import { ClassDetails } from "./ClassDetails";
import type { DirectoryModel, DirectoryResult } from "./types";

type View =
  | { kind: "list" }
  | {
      kind: "organization" | "organization-edit" | "class-new";
      organizationId: string;
    }
  | { kind: "organization-new" }
  | { kind: "class" | "class-edit"; classId: string };

export function OrganizationsPanel({
  model,
  newClassPurpose = "",
}: {
  model: DirectoryModel;
  newClassPurpose?: string;
}) {
  const [view, setView] = useState<View>({ kind: "list" });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const selectedClass =
    "classId" in view
      ? model.classes.find((item) => item.id === view.classId)
      : undefined;
  const organizationId =
    "organizationId" in view
      ? view.organizationId
      : selectedClass?.organizationId;
  const organization = model.organizations.find(
    (item) => item.id === organizationId,
  );
  function afterSave(result: DirectoryResult, kind: "organization" | "class") {
    if (result.ok && result.id)
      setView(
        kind === "organization"
          ? { kind, organizationId: result.id }
          : { kind, classId: result.id },
      );
    return result;
  }
  if (
    view.kind === "organization-new" ||
    (view.kind === "organization-edit" && organization)
  )
    return (
      <OrganizationEditor
        key={view.kind === "organization-new" ? "new" : organization?.id}
        item={view.kind === "organization-edit" ? organization : undefined}
        onSave={(details) =>
          afterSave(
            model.saveOrganization(
              details,
              view.kind === "organization-edit" ? organization?.id : undefined,
            ),
            "organization",
          )
        }
        onBack={() =>
          setView(
            organization
              ? { kind: "organization", organizationId: organization.id }
              : { kind: "list" },
          )
        }
      />
    );
  if (
    organization &&
    (view.kind === "class-new" || (view.kind === "class-edit" && selectedClass))
  )
    return (
      <ClassEditor
        defaultPurpose={newClassPurpose}
        key={selectedClass?.id ?? "new-class"}
        organization={organization}
        item={selectedClass}
        onSave={(details) =>
          afterSave(model.saveClass(details, selectedClass?.id), "class")
        }
        onBack={() =>
          setView(
            selectedClass
              ? { kind: "class", classId: selectedClass.id }
              : { kind: "organization", organizationId: organization.id },
          )
        }
      />
    );
  if (selectedClass && organization && view.kind === "class")
    return (
      <ClassDetails
        key={selectedClass.id}
        item={selectedClass}
        organization={organization}
        model={model}
        onEdit={() =>
          setView({ kind: "class-edit", classId: selectedClass.id })
        }
        onBack={() =>
          setView({ kind: "organization", organizationId: organization.id })
        }
      />
    );
  if (organization && view.kind === "organization")
    return (
      <OrganizationDetails
        key={organization.id}
        organization={organization}
        model={model}
        onBack={() => setView({ kind: "list" })}
        onEdit={() =>
          setView({
            kind: "organization-edit",
            organizationId: organization.id,
          })
        }
        onCreateClass={() =>
          setView({ kind: "class-new", organizationId: organization.id })
        }
        onOpenClass={(id) => setView({ kind: "class", classId: id })}
      />
    );
  const visible = model.organizations.filter(
    (item) =>
      (!query.trim() ||
        `${item.name} ${item.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())) &&
      (status === "all" || (status === "archived") === item.archived),
  );
  return (
    <section className="admin-dir-stack">
      <div className="admin-dir-heading">
        <div>
          <p className="eyebrow">Organize the learning community</p>
          <h2>Organizations & classes</h2>
          <p className="muted">
            Shape each organization, then organize its classes and people.
          </p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => setView({ kind: "organization-new" })}
        >
          <Plus size={16} />
          Create organization
        </button>
      </div>
      <div className="admin-dir-filters">
        <label className="field">
          Search organizations
          <InputField
            type="search"
            placeholder="Name or purpose"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="field">
          Status
          <select
            className="input"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All organizations</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>
      {visible.length ? (
        <div className="admin-dir-card-grid">
          {visible.map((item) => (
            <article className="admin-dir-card admin-dir-stack" key={item.id}>
              <Building2 size={24} aria-hidden="true" />
              <div>
                <h3>{item.name}</h3>
                <span className="admin-dir-status">
                  {item.archived ? "Archived" : "Active"}
                </span>
              </div>
              <p>{item.description || "No purpose added yet."}</p>
              <p className="admin-dir-meta">
                {
                  model.classes.filter(
                    (group) => group.organizationId === item.id,
                  ).length
                }{" "}
                classes
              </p>
              <button
                className="button button-outline"
                type="button"
                onClick={() =>
                  setView({ kind: "organization", organizationId: item.id })
                }
              >
                Open organization
                <ArrowRight size={16} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-dir-empty">
          <Building2 size={32} aria-hidden="true" />
          <h3>
            {model.organizations.length
              ? "No organizations match"
              : "Make space for a learning community"}
          </h3>
          <p>
            {model.organizations.length
              ? "Try another name or status."
              : "Start with an organization and add its adult learning classes, or explore the labelled example workspace."}
          </p>
          {!model.organizations.length && (
            <div className="admin-dir-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={() => setView({ kind: "organization-new" })}
              >
                Create organization
              </button>
              <button
                type="button"
                className="button button-outline"
                onClick={model.loadExamples}
              >
                Explore example workspace
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
