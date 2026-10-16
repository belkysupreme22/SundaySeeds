import { useId, useState, type FormEvent } from "react";
import { Rows3 } from "lucide-react";
import type { AdminSettingsModel, WorkspacePreferences } from "./types";

export function ViewPreferencesForm({ model }: { model: AdminSettingsModel }) {
  const id = useId();
  const [draft, setDraft] = useState<WorkspacePreferences>(() => ({
    ...model.preferences,
  }));
  const [feedback, setFeedback] = useState<{
    message: string;
    error: boolean;
  } | null>(null);
  const dirty = draft.tableDensity !== model.preferences.tableDensity;
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = model.savePreferences(draft);
    setFeedback({ message: result.message, error: !result.ok });
  };
  return (
    <form className="ssettings-form" onSubmit={save}>
      <div className="ssettings-form-heading">
        <div>
          <p className="eyebrow">View preferences</p>
          <h2>A little more room.</h2>
          <p className="muted">Adjust spacing in administration tables.</p>
        </div>
        <span className="badge">
          {dirty ? "Unsaved changes" : "Saved for this session"}
        </span>
      </div>
      <section className="ssettings-card" aria-labelledby={`${id}-heading`}>
        <div className="ssettings-card-heading">
          <span className="ssettings-icon tone-peach">
            <Rows3 size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 id={`${id}-heading`}>Table density</h3>
            <p className="muted">
              Choose comfortable spacing or a compact view.
            </p>
          </div>
        </div>
        <fieldset className="ssettings-density">
          <legend className="ssettings-legend">Admin table spacing</legend>
          {(
            [
              {
                value: "comfortable",
                label: "Comfortable",
                description: "More breathing room between rows.",
              },
              {
                value: "compact",
                label: "Compact",
                description: "More records visible in the same space.",
              },
            ] as const
          ).map((option) => (
            <label
              className={`ssettings-density-option${draft.tableDensity === option.value ? " ssettings-density-selected" : ""}`}
              key={option.value}
            >
              <input
                type="radio"
                name={`${id}-density`}
                value={option.value}
                checked={draft.tableDensity === option.value}
                onChange={() => {
                  setDraft({ tableDensity: option.value });
                  setFeedback(null);
                }}
              />
              <span>
                <strong>{option.label}</strong>
                <span className="muted">{option.description}</span>
              </span>
              <span
                className={`ssettings-density-sample ssettings-density-sample-${option.value}`}
                aria-hidden="true"
              >
                <i />
                <i />
                <i />
              </span>
            </label>
          ))}
        </fieldset>
        <p className="ssettings-hint ssettings-density-hint muted">
          Applies to administration tables after saving. Form controls and
          teacher screens keep their current spacing.
        </p>
      </section>
      <div className="ssettings-actions">
        <button className="button button-primary" type="submit">
          Save preferences
        </button>
        <button
          className="button button-outline"
          type="button"
          disabled={!dirty}
          onClick={() => {
            setDraft({ ...model.preferences });
            setFeedback(null);
          }}
        >
          Cancel changes
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
            ? "Your preference is ready to save."
            : "Workspace defaults are saved separately.")}
      </p>
    </form>
  );
}
