import { useId, useState, type FormEvent } from "react";
import { ArrowLeft, Save, ShieldCheck } from "lucide-react";
import { InputField, TextAreaField } from "../../../shared/ui/InputField";
import type { DirectoryResult, DirectoryState } from "../directory/types";
import {
  capabilityLabels,
  type AccessCapability,
  type AccessRole,
  type AccessScope,
  type RoleDetails,
} from "./types";
import { getScopeContext } from "./scope";

const capabilities = Object.keys(capabilityLabels) as AccessCapability[];

export function RoleEditor({
  role,
  example,
  directory,
  onSave,
  onBack,
}: {
  role?: AccessRole;
  example?: RoleDetails;
  directory: DirectoryState;
  onSave: (details: RoleDetails) => DirectoryResult;
  onBack: () => void;
}) {
  const prefix = useId();
  const initial = role ?? example;
  const [name, setName] = useState(initial?.name ?? "");
  const [purpose, setPurpose] = useState(initial?.purpose ?? "");
  const [kind, setKind] = useState<AccessScope["kind"]>(
    initial?.scope.kind ?? "organization",
  );
  const [scopeId, setScopeId] = useState(
    initial?.scope.kind === "organization"
      ? initial.scope.organizationId
      : (initial?.scope.classId ?? ""),
  );
  const [selected, setSelected] = useState<AccessCapability[]>(
    initial?.capabilities ?? [],
  );
  const [error, setError] = useState("");
  const [discard, setDiscard] = useState(false);
  const initialScopeId =
    initial?.scope.kind === "organization"
      ? initial.scope.organizationId
      : (initial?.scope.classId ?? "");
  const dirty =
    Boolean(example) ||
    name !== (initial?.name ?? "") ||
    purpose !== (initial?.purpose ?? "") ||
    kind !== (initial?.scope.kind ?? "organization") ||
    scopeId !== initialScopeId ||
    capabilities.some(
      (capability) =>
        selected.includes(capability) !==
        (initial?.capabilities.includes(capability) ?? false),
    );
  const organizations = directory.organizations.filter(
    (item) => !item.archived,
  );
  const classes = directory.classes.filter(
    (item) =>
      !item.archived &&
      organizations.some(
        (organization) => organization.id === item.organizationId,
      ),
  );
  const scopeAvailable =
    kind === "organization"
      ? organizations.some((item) => item.id === scopeId)
      : classes.some((item) => item.id === scopeId);
  const initialScope = initial
    ? getScopeContext(directory, initial.scope)
    : undefined;
  function save(event: FormEvent) {
    event.preventDefault();
    if (!scopeId || !scopeAvailable) {
      setError("Choose an available organization or class for this proposal.");
      return;
    }
    if (!selected.length) {
      setError("Choose at least one responsibility for this role proposal.");
      return;
    }
    const scope: AccessScope =
      kind === "organization"
        ? { kind, organizationId: scopeId }
        : { kind, classId: scopeId };
    const result = onSave({ name, purpose, scope, capabilities: selected });
    if (!result.ok) setError(result.message);
  }
  return (
    <section className="access-stack access-surface">
      <button
        className="button button-outline access-back"
        type="button"
        onClick={() => (dirty ? setDiscard(true) : onBack())}
      >
        <ArrowLeft size={16} />
        Back to role proposals
      </button>
      <div className="access-heading">
        <div>
          <p className="eyebrow">Responsibility brief</p>
          <h2>{role ? "Revise role proposal" : "Design a scoped role"}</h2>
          <p className="muted">
            Describe the responsibility, choose its boundaries, then select the
            capabilities it needs.
          </p>
        </div>
        <ShieldCheck size={30} aria-hidden="true" />
      </div>
      {role && (
        <p className="access-notice">
          Revision {role.revision} is saved. Changes create the next proposal
          revision; existing assignment simulations retain their original
          snapshot.
        </p>
      )}
      {discard && (
        <div
          className="access-unsaved"
          role="group"
          aria-label="Discard role proposal changes"
        >
          <p>Discard these unsaved proposal details?</p>
          <div className="access-actions">
            <button
              className="button button-outline"
              type="button"
              onClick={() => setDiscard(false)}
            >
              Keep editing
            </button>
            <button
              className="button button-outline"
              type="button"
              onClick={onBack}
            >
              Discard changes
            </button>
          </div>
        </div>
      )}
      <form className="access-form" onSubmit={save}>
        <label className="field" htmlFor={`${prefix}-name`}>
          Role name
          <InputField
            id={`${prefix}-name`}
            autoFocus
            required
            maxLength={60}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Learning coordinator"
          />
        </label>
        <label className="field" htmlFor={`${prefix}-purpose`}>
          Purpose
          <TextAreaField
            id={`${prefix}-purpose`}
            rows={4}
            maxLength={500}
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            placeholder="What should this role help the learning community accomplish?"
          />
        </label>
        <fieldset className="access-fieldset">
          <legend>Where this role applies</legend>
          <p className="muted">
            Choose one organization or one class. System-wide access and
            permission delegation are outside this proposal.
          </p>
          <div className="access-scope-options">
            {(["organization", "class"] as const).map((value) => (
              <label key={value}>
                <input
                  type="radio"
                  name={`${prefix}-scope-kind`}
                  value={value}
                  checked={kind === value}
                  onChange={() => {
                    setKind(value);
                    setScopeId("");
                  }}
                />
                {value === "organization" ? "Organization" : "Class"}
              </label>
            ))}
          </div>
          {initialScope && !initialScope.available && (
            <p className="access-notice">
              Saved scope: {initialScope.label}. {initialScope.reason} Choose an
              active scope before saving a new revision.
            </p>
          )}
          <label className="field" htmlFor={`${prefix}-scope`}>
            {kind === "organization" ? "Organization" : "Class"}
            <select
              id={`${prefix}-scope`}
              className="input"
              required
              value={scopeAvailable ? scopeId : ""}
              onChange={(event) => setScopeId(event.target.value)}
            >
              <option value="">
                Choose {kind === "organization" ? "an organization" : "a class"}
              </option>
              {kind === "organization"
                ? organizations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))
                : classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {
                        directory.organizations.find(
                          (organization) =>
                            organization.id === item.organizationId,
                        )?.name
                      }{" "}
                      / {item.name}
                    </option>
                  ))}
            </select>
          </label>
          {!(kind === "organization"
            ? organizations.length
            : classes.length) && (
            <p className="muted">
              No active {kind === "organization" ? "organizations" : "classes"}{" "}
              are available. Return to the directory to create or restore one.
            </p>
          )}
        </fieldset>
        <fieldset className="access-fieldset">
          <legend>Proposed capabilities</legend>
          <p className="muted">
            Select only the responsibilities needed for the chosen scope.
          </p>
          <div className="access-capability-list">
            {capabilities.map((capability) => (
              <label key={capability}>
                <input
                  type="checkbox"
                  checked={selected.includes(capability)}
                  onChange={(event) =>
                    setSelected((current) =>
                      event.target.checked
                        ? [...current, capability]
                        : current.filter((item) => item !== capability),
                    )
                  }
                />
                <span>{capabilityLabels[capability]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p className="access-error" role="alert">
            {error}
          </p>
        )}
        <div className="access-actions">
          <button className="button button-primary" type="submit">
            <Save size={16} />
            {role ? "Save next revision" : "Save role proposal"}
          </button>
          <span className="muted">
            {dirty ? "Unsaved details" : "No unsaved changes"}
          </span>
        </div>
      </form>
    </section>
  );
}
