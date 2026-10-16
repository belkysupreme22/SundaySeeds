import { useId, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { InputField, TextAreaField } from "../../../shared/ui/InputField";
import type {
  ClassDetails,
  DirectoryClass,
  DirectoryOrganization,
  DirectoryResult,
} from "./types";

export function ClassEditor({
  item,
  organization,
  onSave,
  onBack,
  defaultPurpose = "",
}: {
  item?: DirectoryClass;
  organization: DirectoryOrganization;
  onSave: (details: ClassDetails) => DirectoryResult;
  onBack: () => void;
  defaultPurpose?: string;
}) {
  const prefix = useId();
  const [name, setName] = useState(item?.name ?? "");
  const [initialDescription] = useState(item?.description ?? defaultPurpose);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState("");
  const [discard, setDiscard] = useState(false);
  const dirty =
    name !== (item?.name ?? "") || description !== initialDescription;
  function save(event: FormEvent) {
    event.preventDefault();
    const result = onSave({
      name,
      description,
      organizationId: organization.id,
    });
    if (!result.ok) setError(result.message);
  }
  return (
    <section className="admin-dir-stack admin-dir-surface">
      <button
        type="button"
        className="button button-outline admin-dir-back"
        onClick={() => (dirty ? setDiscard(true) : onBack())}
      >
        <ArrowLeft size={16} />
        Back to {organization.name}
      </button>
      <div className="admin-dir-heading">
        <p className="eyebrow">Class brief</p>
        <h2>{item ? "Edit class" : "Create a class"}</h2>
      </div>
      <p className="admin-dir-scope">
        Organization: <strong>{organization.name}</strong>. Moving a class
        between organizations is not available.
      </p>
      {!item && initialDescription && (
        <p className="muted">
          The purpose starts with your workspace default. Edit it for this class
          without changing that default.
        </p>
      )}
      {discard && (
        <div
          className="admin-dir-confirm"
          role="group"
          aria-label="Discard class changes"
        >
          <p>Discard these unsaved class details?</p>
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
          Class name
          <InputField
            id={`${prefix}-name`}
            autoFocus
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Everyday faith · adult study"
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
            placeholder="What will this class explore together?"
          />
        </label>
        {error && (
          <p role="alert" className="admin-dir-error">
            {error}
          </p>
        )}
        <div className="admin-dir-actions">
          <button type="submit" className="button button-primary">
            <Save size={16} />
            Save class
          </button>
          <span className="muted">
            {dirty ? "Unsaved details" : "No unsaved changes"}
          </span>
        </div>
      </form>
    </section>
  );
}
