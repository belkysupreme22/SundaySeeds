import { useState, type FormEvent } from "react";
import { InputField } from "../../../shared/ui/InputField";
import {
  directoryRoleLabels,
  type DirectoryModel,
  type DirectoryPerson,
  type DirectoryRole,
} from "./types";

export function PersonEditor({
  model,
  item,
  onClose,
  onSaved,
}: {
  model: DirectoryModel;
  item?: DirectoryPerson;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [email, setEmail] = useState(item?.email ?? "");
  const [role, setRole] = useState<DirectoryRole>(item?.role ?? "learner");
  const [error, setError] = useState("");
  const [discard, setDiscard] = useState(false);
  const protectedEmail = Boolean(
    item &&
    (model.memberships.some((member) => member.personId === item.id) ||
      model.invitations.some(
        (invite) => invite.email.toLowerCase() === item.email.toLowerCase(),
      )),
  );
  const dirty =
    name !== (item?.name ?? "") ||
    email !== (item?.email ?? "") ||
    role !== (item?.role ?? "learner");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = model.savePerson({ name, email, role }, item?.id);
    if (result.ok && result.id) onSaved(result.id);
    else setError(result.message);
  }
  return (
    <section className="admin-dir-surface admin-dir-stack">
      <header className="admin-dir-heading">
        <div>
          <p className="eyebrow">Directory record</p>
          <h2>
            {item
              ? "A familiar name, clearly recorded."
              : "Introduce someone to the directory."}
          </h2>
          <p className="muted">
            These details describe an adult learner or teacher in the
            simulation. Saving does not create a sign-in account.
          </p>
        </div>
        <button
          type="button"
          className="button button-outline"
          onClick={() => (dirty ? setDiscard(true) : onClose())}
        >
          Back to people
        </button>
      </header>
      {discard && (
        <div
          className="admin-dir-confirm"
          role="group"
          aria-label="Discard person details"
        >
          <p>Discard these unsaved details?</p>
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
              onClick={onClose}
            >
              Discard details
            </button>
          </div>
        </div>
      )}
      <form className="admin-dir-form" onSubmit={submit}>
        <label className="field">
          Name
          <InputField
            autoFocus
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name for this example record"
          />
        </label>
        <label className="field">
          Example email
          <InputField
            type="email"
            required
            maxLength={254}
            readOnly={protectedEmail}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="learner@example.test"
          />
          {protectedEmail && (
            <span className="muted">
              This email is linked to memberships or invitations. Changing it
              requires a future identity-management flow.
            </span>
          )}
        </label>
        <label className="field">
          Directory classification
          <select
            className="input"
            value={role}
            disabled={Boolean(item)}
            onChange={(event) => setRole(event.target.value as DirectoryRole)}
          >
            {Object.entries(directoryRoleLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
          <span className="muted">
            Existing classifications and administrator capabilities are handled
            separately in the access plan.
          </span>
        </label>
        {error && (
          <p className="admin-dir-error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-dir-actions">
          <button type="submit" className="button button-primary">
            Save directory record
          </button>
          <span className="muted">
            {dirty ? "Unsaved details" : "No unsaved changes"}
          </span>
        </div>
      </form>
    </section>
  );
}
