import { useId, useState, type FormEvent } from "react";
import { InputField } from "../../../shared/ui/InputField";
import {
  directoryRoleLabels,
  type DirectoryModel,
  type DirectoryRole,
} from "./types";

export function InvitationForm({
  model,
  onClose,
  onCreated,
}: {
  model: DirectoryModel;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const prefix = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [classId, setClassId] = useState("");
  const [role, setRole] = useState<DirectoryRole>("learner");
  const [error, setError] = useState("");
  const [discard, setDiscard] = useState(false);
  const available = model.classes.filter(
    (item) =>
      !item.archived &&
      model.organizations.some(
        (org) => org.id === item.organizationId && !org.archived,
      ),
  );
  const validClass = available.some((item) => item.id === classId);
  const dirty = Boolean(name || email || classId || role !== "learner");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = model.createInvitation({ name, email, classId, role });
    if (result.ok && result.id) onCreated(result.id);
    else setError(result.message);
  }
  return (
    <section className="admin-dir-surface admin-dir-stack">
      <div className="admin-dir-heading">
        <div>
          <p className="eyebrow">Invitation simulation</p>
          <h2>Make the invitation clear.</h2>
          <p className="muted">
            Choose an adult learner or teacher and an explicit class. No email,
            account or access grant is created.
          </p>
        </div>
        <button
          type="button"
          className="button button-outline"
          onClick={() => (dirty ? setDiscard(true) : onClose())}
        >
          Back to invitations
        </button>
      </div>
      {discard && (
        <div
          className="admin-dir-confirm"
          role="group"
          aria-label="Discard invitation details"
        >
          <p>Discard these unsaved invitation details?</p>
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
        <div className="admin-dir-form-grid">
          <label className="field" htmlFor={`${prefix}-name`}>
            Name
            <InputField
              id={`${prefix}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
              autoFocus
            />
          </label>
          <label className="field" htmlFor={`${prefix}-email`}>
            Example email
            <InputField
              id={`${prefix}-email`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={254}
              placeholder="learner@example.test"
              required
            />
          </label>
        </div>
        <label className="field" htmlFor={`${prefix}-role`}>
          Class participation
          <select
            id={`${prefix}-role`}
            className="input"
            value={role}
            onChange={(event) => setRole(event.target.value as DirectoryRole)}
          >
            {Object.entries(directoryRoleLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
          <span className="muted">
            This describes simulated participation. Administrator capabilities
            belong in Access &amp; roles.
          </span>
        </label>
        <label className="field" htmlFor={`${prefix}-class`}>
          Organization / class
          <select
            id={`${prefix}-class`}
            className="input"
            value={validClass ? classId : ""}
            onChange={(event) => setClassId(event.target.value)}
            required
          >
            <option value="">Choose a class</option>
            {available.map((item) => (
              <option key={item.id} value={item.id}>
                {
                  model.organizations.find(
                    (org) => org.id === item.organizationId,
                  )?.name
                }{" "}
                / {item.name}
              </option>
            ))}
          </select>
        </label>
        {!available.length && (
          <p className="admin-dir-note">
            Create an open class inside an active organization before preparing
            an invitation.
          </p>
        )}
        {error && (
          <p role="alert" className="admin-dir-error">
            {error}
          </p>
        )}
        <div className="admin-dir-actions">
          <button
            type="submit"
            className="button button-primary"
            disabled={!validClass}
          >
            Create simulated invitation
          </button>
          <span className="muted">Saved only for this workspace session.</span>
        </div>
      </form>
    </section>
  );
}
