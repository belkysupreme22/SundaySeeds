import { useId, useState, type FormEvent } from "react";
import { BookOpen, LifeBuoy, RotateCcw, UserPlus } from "lucide-react";
import { InputField, TextAreaField } from "../../../shared/ui/InputField";
import type { DirectoryState } from "../directory/types";
import {
  createWorkspaceDefaults,
  type AdminSettingsModel,
  type WorkspaceDefaults,
} from "./types";

export function WorkspaceDefaultsForm({
  model,
  directory,
}: {
  model: AdminSettingsModel;
  directory: DirectoryState;
}) {
  const id = useId();
  const [draft, setDraft] = useState<WorkspaceDefaults>(() => ({
    ...model.defaults,
  }));
  const [feedback, setFeedback] = useState<{
    message: string;
    error: boolean;
  } | null>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(model.defaults);
  const availableClasses = directory.classes.filter(
    (item) =>
      !item.archived &&
      directory.organizations.some(
        (organization) =>
          organization.id === item.organizationId && !organization.archived,
      ),
  );
  const unavailableClass = Boolean(
    draft.invitationClassId &&
    !availableClasses.some((item) => item.id === draft.invitationClassId),
  );
  const selectedClass = directory.classes.find(
    (item) => item.id === draft.invitationClassId,
  );
  const classLabel = (classId: string) => {
    const item = directory.classes.find((entry) => entry.id === classId);
    const organization = directory.organizations.find(
      (entry) => entry.id === item?.organizationId,
    );
    return item
      ? `${organization?.name ?? "Unavailable organization"} / ${item.name}`
      : "Previously selected class";
  };
  const change = <K extends keyof WorkspaceDefaults>(
    key: K,
    value: WorkspaceDefaults[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setFeedback(null);
  };
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (unavailableClass) {
      setFeedback({
        error: true,
        message: "Choose an active class or No default class before saving.",
      });
      return;
    }
    const result = model.saveDefaults(draft);
    if (result.ok)
      setDraft({
        ...draft,
        newClassPurpose: draft.newClassPurpose.trim(),
        helpTitle: draft.helpTitle.trim(),
        helpMessage: draft.helpMessage.trim(),
      });
    setFeedback({ message: result.message, error: !result.ok });
  };
  return (
    <form className="ssettings-form" onSubmit={save}>
      <div className="ssettings-form-heading">
        <div>
          <p className="eyebrow">Workspace defaults</p>
          <h2>A useful starting point.</h2>
          <p className="muted">
            Prefill new admin forms and shape the guidance on Overview.
          </p>
        </div>
        <span className="badge">
          {dirty ? "Unsaved changes" : "Saved for this session"}
        </span>
      </div>
      <section className="ssettings-card" aria-labelledby={`${id}-classes`}>
        <div className="ssettings-card-heading">
          <span className="ssettings-icon tone-mint">
            <BookOpen size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 id={`${id}-classes`}>New classes</h3>
            <p className="muted">Give each new class a starting brief.</p>
          </div>
        </div>
        <div className="ssettings-card-body">
          <label className="field" htmlFor={`${id}-purpose`}>
            <span>
              Default class purpose <span className="muted">(optional)</span>
            </span>
            <TextAreaField
              id={`${id}-purpose`}
              value={draft.newClassPurpose}
              maxLength={1000}
              rows={4}
              onChange={(event) =>
                change("newClassPurpose", event.target.value)
              }
              aria-describedby={`${id}-purpose-hint`}
            />
          </label>
          <p className="ssettings-hint muted" id={`${id}-purpose-hint`}>
            Applies when opening a new class form in Administration. Existing
            classes and forms already open keep their content.
          </p>
        </div>
      </section>
      <section className="ssettings-card" aria-labelledby={`${id}-invitations`}>
        <div className="ssettings-card-heading">
          <span className="ssettings-icon tone-lavender">
            <UserPlus size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 id={`${id}-invitations`}>New invitations</h3>
            <p className="muted">Choose the initial role and class.</p>
          </div>
        </div>
        <div className="ssettings-card-body">
          <div className="ssettings-fields">
            <label className="field" htmlFor={`${id}-role`}>
              <span>Default invitation role</span>
              <select
                className="input"
                id={`${id}-role`}
                value={draft.invitationRole}
                onChange={(event) =>
                  change(
                    "invitationRole",
                    event.target.value as WorkspaceDefaults["invitationRole"],
                  )
                }
              >
                <option value="learner">Adult learner</option>
                <option value="teacher">Teacher</option>
              </select>
            </label>
            <label className="field" htmlFor={`${id}-class`}>
              <span>
                Default class <span className="muted">(optional)</span>
              </span>
              <select
                className="input"
                id={`${id}-class`}
                value={draft.invitationClassId}
                onChange={(event) =>
                  change("invitationClassId", event.target.value)
                }
                aria-describedby={`${id}-class-hint`}
                aria-invalid={unavailableClass || undefined}
              >
                <option value="">No default class</option>
                {unavailableClass && (
                  <option value={draft.invitationClassId}>
                    {classLabel(draft.invitationClassId)} — unavailable
                    {selectedClass?.archived ? " (archived)" : ""}
                  </option>
                )}
                {availableClasses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {classLabel(item.id)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="ssettings-hint muted" id={`${id}-class-hint`}>
            Only active classes in active organizations are available. Each
            invitation still needs a name, email and class; defaults do not
            grant access or send messages.
          </p>
          {unavailableClass && (
            <p className="ssettings-warning" role="alert">
              The selected default class is no longer available. Choose another
              class or No default class before saving.
            </p>
          )}
        </div>
      </section>
      <section className="ssettings-card" aria-labelledby={`${id}-help`}>
        <div className="ssettings-card-heading">
          <span className="ssettings-icon tone-yellow">
            <LifeBuoy size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 id={`${id}-help`}>Overview guidance</h3>
            <p className="muted">A short welcome and a clear next step.</p>
          </div>
        </div>
        <div className="ssettings-card-body">
          <label className="field" htmlFor={`${id}-help-title`}>
            <span>Help card title</span>
            <InputField
              id={`${id}-help-title`}
              value={draft.helpTitle}
              required
              maxLength={80}
              onChange={(event) => change("helpTitle", event.target.value)}
            />
          </label>
          <label className="field" htmlFor={`${id}-help-message`}>
            <span>Help card message</span>
            <TextAreaField
              id={`${id}-help-message`}
              value={draft.helpMessage}
              required
              maxLength={1200}
              rows={5}
              onChange={(event) => change("helpMessage", event.target.value)}
            />
          </label>
          <p className="ssettings-hint muted">
            Saved wording appears on Administration → Overview.
          </p>
        </div>
      </section>
      <div className="ssettings-form-footer">
        <div className="ssettings-actions">
          <button className="button button-primary" type="submit">
            Save defaults
          </button>
          <button
            className="button button-outline"
            type="button"
            disabled={!dirty}
            onClick={() => {
              setDraft({ ...model.defaults });
              setFeedback(null);
            }}
          >
            Cancel changes
          </button>
        </div>
        <button
          className="button button-outline"
          type="button"
          onClick={() => {
            setDraft(createWorkspaceDefaults());
            setFeedback({
              error: false,
              message:
                "Original defaults loaded into this form. Save defaults to apply them.",
            });
          }}
        >
          <RotateCcw size={16} aria-hidden="true" />
          Restore original defaults
        </button>
      </div>
      <p
        className={
          feedback?.error
            ? "ssettings-feedback ssettings-warning"
            : "ssettings-feedback muted"
        }
        role={feedback?.error ? "alert" : "status"}
      >
        {feedback?.message ??
          (dirty
            ? "Your changes are ready to save."
            : "Changes take effect only after saving. Teacher and learner settings are separate.")}
      </p>
    </form>
  );
}
