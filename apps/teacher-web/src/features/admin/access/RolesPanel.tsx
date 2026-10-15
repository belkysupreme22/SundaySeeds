import { useState } from "react";
import {
  ArrowRight,
  FilePenLine,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { DirectoryState } from "../directory/types";
import { RoleEditor } from "./RoleEditor";
import { getScopeContext } from "./scope";
import { capabilityLabels, type AccessModel, type RoleDetails } from "./types";

type Editor = { roleId?: string; example?: RoleDetails };

export function RolesPanel({
  model,
  directory,
  onOpenDirectory,
}: {
  model: AccessModel;
  directory: DirectoryState;
  onOpenDirectory: () => void;
}) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [notice, setNotice] = useState("");
  const activeOrganization = directory.organizations.find(
    (item) => !item.archived,
  );
  const activeClass = directory.classes.find(
    (item) =>
      !item.archived &&
      directory.organizations.some(
        (organization) =>
          organization.id === item.organizationId && !organization.archived,
      ),
  );
  const hasScope = Boolean(activeOrganization || activeClass);
  const role = editor?.roleId
    ? model.roles.find((item) => item.id === editor.roleId)
    : undefined;
  function exampleBrief() {
    const scope = activeOrganization
      ? { kind: "organization" as const, organizationId: activeOrganization.id }
      : activeClass
        ? { kind: "class" as const, classId: activeClass.id }
        : undefined;
    if (!scope) return;
    setEditor({
      example: {
        name: "Learning coordinator — example",
        purpose:
          "Support adult learners by keeping class membership organized and reviewing learning summaries within the chosen scope.",
        scope,
        capabilities: ["people.read", "enrollment.manage", "reports.read"],
      },
    });
  }
  if (editor)
    return (
      <RoleEditor
        key={editor.roleId ?? (editor.example ? "example" : "new")}
        role={role}
        example={editor.example}
        directory={directory}
        onBack={() => setEditor(null)}
        onSave={(details) => {
          const result = model.saveRole(details, editor.roleId);
          if (result.ok) {
            setNotice(result.message);
            setEditor(null);
          }
          return result;
        }}
      />
    );
  return (
    <section className="access-stack">
      <div className="access-heading">
        <div>
          <p className="eyebrow">Sub-admin responsibilities</p>
          <h2>Role proposals</h2>
          <p className="muted">
            Build a clear brief for each responsibility before recording an
            assignment simulation.
          </p>
        </div>
        <button
          className="button button-primary"
          type="button"
          disabled={!hasScope}
          onClick={() => setEditor({})}
        >
          <Plus size={16} />
          Create proposal
        </button>
      </div>
      <div className="access-notice">
        <ShieldCheck size={20} aria-hidden="true" />
        <p>
          These are scoped proposals. Saving a role or assignment simulation
          does not grant live access. System-wide administration and permission
          delegation remain undecided.
        </p>
      </div>
      {notice && (
        <p role="status" className="access-notice">
          {notice}
        </p>
      )}
      {!hasScope && (
        <div className="access-empty access-surface">
          <p className="eyebrow">Start with a boundary</p>
          <h3>A role needs an active organization or class</h3>
          <p className="muted">
            Create an organization in the directory, restore an archived one, or
            explore the fictional workspace to try this flow.
          </p>
          <button
            className="button button-outline"
            type="button"
            onClick={onOpenDirectory}
          >
            Open organizations
            <ArrowRight size={16} />
          </button>
        </div>
      )}
      {!model.roles.length ? (
        <div className="access-empty access-surface">
          <div className="access-empty-icon">
            <FilePenLine size={26} aria-hidden="true" />
          </div>
          <h3>No role proposals yet</h3>
          <p className="muted">
            Start with a name and purpose, choose one scope, then select the
            capabilities needed for that responsibility.
          </p>
          {hasScope && (
            <div className="access-actions">
              <button
                className="button button-primary"
                type="button"
                onClick={() => setEditor({})}
              >
                <Plus size={16} />
                Create proposal
              </button>
              <button
                className="button button-outline"
                type="button"
                onClick={exampleBrief}
              >
                <Sparkles size={16} />
                Use example brief
              </button>
            </div>
          )}
          <p className="muted">
            The example opens an editable brief. It is saved only when you
            choose to save it.
          </p>
        </div>
      ) : (
        <>
          <div className="access-role-grid">
            {model.roles.map((item) => {
              const scope = getScopeContext(directory, item.scope);
              return (
                <article
                  className="access-role-card access-surface"
                  key={item.id}
                >
                  <div className="access-heading">
                    <div>
                      <p className="eyebrow">Revision {item.revision}</p>
                      <h3>{item.name}</h3>
                    </div>
                    <ShieldCheck size={22} aria-hidden="true" />
                  </div>
                  <p className="muted">
                    {item.purpose || "No purpose provided."}
                  </p>
                  <div className="access-badges">
                    <span className="tag">
                      {item.scope.kind === "organization"
                        ? "Organization"
                        : "Class"}{" "}
                      scope
                    </span>
                    <span className="tag">
                      {scope.available
                        ? "Scope available"
                        : "Scope unavailable"}
                    </span>
                  </div>
                  <p className="access-scope-label">{scope.label}</p>
                  {!scope.available && (
                    <p className="access-notice">{scope.reason}</p>
                  )}
                  <ul
                    className="access-role-capabilities"
                    aria-label="Proposed capabilities"
                  >
                    {item.capabilities.map((capability) => (
                      <li key={capability}>{capabilityLabels[capability]}</li>
                    ))}
                  </ul>
                  <button
                    className="button button-outline"
                    type="button"
                    onClick={() => setEditor({ roleId: item.id })}
                  >
                    <FilePenLine size={16} />
                    Revise proposal
                  </button>
                </article>
              );
            })}
          </div>
          <p className="muted">
            Revising a proposal changes future assignment simulations. Existing
            records keep the name, scope, capabilities and revision originally
            reviewed.
          </p>
          {hasScope && (
            <button
              className="button button-outline access-back"
              type="button"
              onClick={exampleBrief}
            >
              <Sparkles size={16} />
              Use example brief
            </button>
          )}
        </>
      )}
    </section>
  );
}
