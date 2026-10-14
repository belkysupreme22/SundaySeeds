import { useState, type FormEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, X } from "lucide-react";
import { InputField } from "../../shared/ui/InputField";

const responsibilities = [
  "View adult learner records",
  "Prepare lesson drafts",
  "Review learning reports",
] as const;

interface RoleProposal {
  name: string;
  boundary: string;
  responsibilities: string[];
}

export default function RoleProposalDialog() {
  const [name, setName] = useState("Sub-admin");
  const [boundary, setBoundary] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<RoleProposal | null>(null);
  const [draftChanged, setDraftChanged] = useState(false);

  function updateDraft() {
    if (preview) setDraftChanged(true);
  }

  function previewProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreview({
      name: name.trim() || "Sub-admin",
      boundary: boundary.trim(),
      responsibilities: [...selected],
    });
    setDraftChanged(false);
  }

  function clearDraft() {
    setName("Sub-admin");
    setBoundary("");
    setSelected([]);
    setPreview(null);
    setDraftChanged(false);
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button type="button" className="button button-primary">
          Explore a role proposal <ArrowRight size={17} aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content admin-role-dialog">
          <div className="dialog-header">
            <div>
              <p className="eyebrow">Access planning</p>
              <Dialog.Title>Sketch a sub-admin role</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="icon-button"
                aria-label="Close role proposal"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="muted">
            Explore a responsibility and its boundary. This proposal creates no
            role or permission.
          </Dialog.Description>
          <form
            onSubmit={previewProposal}
            className="form-grid admin-role-form"
          >
            <label className="field">
              Role name
              <InputField
                value={name}
                maxLength={60}
                required
                onChange={(event) => {
                  setName(event.target.value);
                  updateDraft();
                }}
              />
            </label>
            <label className="field">
              Proposed boundary
              <InputField
                value={boundary}
                maxLength={180}
                placeholder="Describe the area this role would manage"
                onChange={(event) => {
                  setBoundary(event.target.value);
                  updateDraft();
                }}
              />
              <span className="muted admin-help">
                Leave blank while the scope is undecided.
              </span>
            </label>
            <fieldset className="admin-responsibilities">
              <legend>Proposed responsibilities</legend>
              {responsibilities.map((responsibility) => (
                <label key={responsibility} className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={selected.includes(responsibility)}
                    onChange={(event) => {
                      setSelected((current) =>
                        event.target.checked
                          ? [...current, responsibility]
                          : current.filter((item) => item !== responsibility),
                      );
                      updateDraft();
                    }}
                  />
                  {responsibility}
                </label>
              ))}
            </fieldset>
            <div className="dialog-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={clearDraft}
              >
                Clear draft
              </button>
              <button type="submit" className="button button-primary">
                Preview proposal
              </button>
            </div>
          </form>
          <section
            className="admin-proposal-preview tone-mint"
            aria-live="polite"
            aria-labelledby="role-preview-heading"
          >
            <h3 id="role-preview-heading">Proposal preview</h3>
            {preview ? (
              <>
                {draftChanged && (
                  <p className="admin-help">
                    Draft changed. Preview again to show your latest choices.
                  </p>
                )}
                <dl>
                  <dt>Role</dt>
                  <dd>{preview.name}</dd>
                  <dt>Boundary</dt>
                  <dd>
                    {preview.boundary || "Undecided — no scope configured"}
                  </dd>
                  <dt>Responsibilities</dt>
                  <dd>
                    {preview.responsibilities.length ? (
                      <ul>
                        {preview.responsibilities.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      "None selected"
                    )}
                  </dd>
                </dl>
              </>
            ) : (
              <p className="muted">Your proposed scope will appear here.</p>
            )}
            <p className="admin-help">
              Unsaved proposal. No access has been assigned.
            </p>
          </section>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
