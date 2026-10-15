import { useId, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { InputField, TextAreaField } from "../../../shared/ui/InputField";
import type { ClassDetails, TeachingClass } from "./types";

export function ClassEditor({
  item,
  onSave,
  onClose,
}: {
  item?: TeachingClass;
  onSave: (details: ClassDetails) => void;
  onClose: () => void;
}) {
  const prefix = useId();
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [meeting, setMeeting] = useState(item?.meeting ?? "");
  const [error, setError] = useState("");
  const [discard, setDiscard] = useState(false);
  const dirty =
    name !== (item?.name ?? "") ||
    description !== (item?.description ?? "") ||
    meeting !== (item?.meeting ?? "");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Give the class a name before saving.");
      return;
    }
    onSave({ name, description, meeting });
  }
  return (
    <section className="class-editor class-surface">
      <button
        className="button button-outline"
        type="button"
        onClick={() => (dirty ? setDiscard(true) : onClose())}
      >
        <ArrowLeft size={16} />
        Back to classes
      </button>
      <div>
        <p className="eyebrow">Class workspace simulation</p>
        <h2>{item ? "Edit the class brief" : "Make room for learning"}</h2>
        <p className="muted">
          Organize an adult study group. Saving creates a class draft for this
          session; it does not create accounts or grant access.
        </p>
      </div>
      {discard && (
        <div
          className="class-confirm"
          role="group"
          aria-label="Discard class changes"
        >
          <p>Discard these unsaved class details?</p>
          <div className="class-actions">
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
              onClick={onClose}
            >
              Discard changes
            </button>
          </div>
        </div>
      )}
      <form className="form-grid" onSubmit={submit}>
        <label className="field" htmlFor={`${prefix}-name`}>
          Class name{" "}
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
        <label className="field" htmlFor={`${prefix}-description`}>
          Purpose{" "}
          <TextAreaField
            id={`${prefix}-description`}
            rows={4}
            maxLength={1200}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What will the group explore together?"
          />
        </label>
        <label className="field" htmlFor={`${prefix}-meeting`}>
          Learning rhythm{" "}
          <InputField
            id={`${prefix}-meeting`}
            maxLength={240}
            value={meeting}
            onChange={(event) => setMeeting(event.target.value)}
            placeholder="e.g. Weekly discussion and self-paced reading"
          />
          <span className="muted">
            An optional note, not a scheduled meeting or reminder.
          </span>
        </label>
        {error && (
          <p className="teacher-form-error" role="alert">
            {error}
          </p>
        )}
        <div className="class-actions">
          <button className="button button-primary" type="submit">
            <Save size={16} />
            Save simulated class
          </button>
          <span className="muted">
            {dirty ? "Unsaved details" : "No unsaved changes"}
          </span>
        </div>
      </form>
    </section>
  );
}
