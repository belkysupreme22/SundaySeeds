import { useId, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { InputField, TextAreaField } from "../../../shared/ui/InputField";
import type {
  DirectoryOrganization,
  DirectoryResult,
  OrganizationDetails,
} from "./types";

export function OrganizationEditor({
  item,
  onSave,
  onBack,
}: {
  item?: DirectoryOrganization;
  onSave: (details: OrganizationDetails) => DirectoryResult;
  onBack: () => void;
}) {
  const prefix = useId();
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [error, setError] = useState("");
  const [discard, setDiscard] = useState(false);
  const dirty =
    name !== (item?.name ?? "") || description !== (item?.description ?? "");
  function save(event: FormEvent) {
    event.preventDefault();
    const result = onSave({ name, description });
    if (!result.ok) setError(result.message);
  }
  return (
    <section className="admin-dir-stack admin-dir-surface">
      <button
        className="button button-outline admin-dir-back"
        type="button"
        onClick={() => (dirty ? setDiscard(true) : onBack())}
      >
        <ArrowLeft size={16} />
        Back to organizations
      </button>
      <div className="admin-dir-heading">
        <p className="eyebrow">Organization brief</p>
        <h2>{item ? "Edit organization" : "A home for your classes"}</h2>
        <p className="muted">
          Give the organization a clear name and purpose. Class and people
          records stay within their chosen scope.
        </p>
      </div>
      {discard && (
        <div
          className="admin-dir-confirm"
          role="group"
          aria-label="Discard organization changes"
        >
          <p>Discard these unsaved organization details?</p>
          <div className="admin-dir-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() => setDiscard(false)}
            >
              Keep editing
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={onBack}
            >
              Discard changes
            </button>
          </div>
        </div>
      )}
      <form className="admin-dir-form" onSubmit={save}>
        <label className="field" htmlFor={`${prefix}-name`}>
          Organization name
          <InputField
            id={`${prefix}-name`}
            autoFocus
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Grace Learning Community"
          />
        </label>
        <label className="field" htmlFor={`${prefix}-purpose`}>
          Purpose
          <TextAreaField
            id={`${prefix}-purpose`}
            rows={5}
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Who does this organization bring together?"
          />
        </label>
        {error && (
          <p role="alert" className="admin-dir-error">
            {error}
          </p>
        )}
        <div className="admin-dir-actions">
          <button className="button button-primary" type="submit">
            <Save size={16} />
            Save organization
          </button>
          <span className="muted">
            {dirty ? "Unsaved details" : "No unsaved changes"}
          </span>
        </div>
      </form>
    </section>
  );
}
