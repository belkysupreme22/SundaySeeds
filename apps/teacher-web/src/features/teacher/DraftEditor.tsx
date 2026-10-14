import * as Dialog from "@radix-ui/react-dialog";
import { BookOpen, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { InputField, TextAreaField } from "../../shared/ui/InputField";

export interface LessonDraft {
  id: string;
  title: string;
  scripture: string;
  body: string;
  reflection: string;
}

interface DraftEditorProps {
  draft: LessonDraft | null;
  onSave: (draft: Omit<LessonDraft, "id">) => void;
  onClose: () => void;
  restoreFocus: () => void;
}

export function DraftEditor({
  draft,
  onSave,
  onClose,
  restoreFocus,
}: DraftEditorProps) {
  const [title, setTitle] = useState(draft?.title ?? "");
  const [scripture, setScripture] = useState(draft?.scripture ?? "");
  const [body, setBody] = useState(draft?.body ?? "");
  const [reflection, setReflection] = useState(draft?.reflection ?? "");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Add a lesson title and a reading before saving.");
      return;
    }
    onSave({
      title: title.trim(),
      scripture: scripture.trim(),
      body: body.trim(),
      reflection: reflection.trim(),
    });
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="dialog-content teacher-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restoreFocus();
          }}
        >
          <div className="dialog-header">
            <div>
              <p className="eyebrow">Lesson studio</p>
              <Dialog.Title>
                {draft ? "Edit lesson draft" : "Create a lesson draft"}
              </Dialog.Title>
            </div>
            <Dialog.Close
              className="icon-button"
              aria-label="Close lesson editor"
            >
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="muted teacher-dialog-description">
            Shape a reading and a reflection for adult learners. Drafts in this
            preview reset when you refresh the page.
          </Dialog.Description>
          <form className="teacher-editor-form" onSubmit={submit}>
            <label className="field">
              Lesson title <span className="teacher-required">Required</span>
              <InputField
                autoFocus
                required
                maxLength={100}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Give your lesson a clear title"
              />
            </label>
            <label className="field">
              Scripture reference
              <InputField
                maxLength={100}
                value={scripture}
                onChange={(event) => setScripture(event.target.value)}
                placeholder="For example, Luke 10:25–37"
              />
            </label>
            <label className="field">
              Reading <span className="teacher-required">Required</span>
              <TextAreaField
                className="teacher-reading-input"
                required
                maxLength={6000}
                rows={7}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write your teaching and a reflection for everyday life."
              />
            </label>
            <label className="field">
              Reflection question
              <InputField
                maxLength={250}
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                placeholder="What could this look like in your week?"
              />
            </label>
            {error && (
              <p className="teacher-form-error" role="alert">
                {error}
              </p>
            )}
            <p className="muted teacher-form-note">
              Publishing, image uploads and a full quiz builder are planned
              next.
            </p>
            <div className="dialog-actions">
              <Dialog.Close className="button button-outline" type="button">
                Cancel
              </Dialog.Close>
              <button className="button button-primary" type="submit">
                Save preview draft
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface LessonPreviewProps {
  draft: LessonDraft;
  example: boolean;
  onClose: () => void;
  restoreFocus: () => void;
}

export function LessonPreview({
  draft,
  example,
  onClose,
  restoreFocus,
}: LessonPreviewProps) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="dialog-content teacher-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restoreFocus();
          }}
        >
          <div className="dialog-header">
            <div>
              <p className="eyebrow">
                {example ? "Example content" : "Draft"} · Learner preview
              </p>
              <Dialog.Title>{draft.title}</Dialog.Title>
            </div>
            <Dialog.Close
              className="icon-button"
              aria-label="Close lesson preview"
            >
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="muted teacher-dialog-description">
            A reading and reflection preview. This lesson has not been
            published.
          </Dialog.Description>
          {draft.scripture && (
            <p className="teacher-scripture">
              <BookOpen size={18} aria-hidden="true" />
              {draft.scripture}
            </p>
          )}
          <div className="teacher-preview-reading">{draft.body}</div>
          {draft.reflection && (
            <section className="panel tone-yellow teacher-reflection">
              <p className="eyebrow">Take a moment</p>
              <h3>{draft.reflection}</h3>
              <p className="muted">
                Consider this question as you go into your week.
              </p>
            </section>
          )}
          <div className="dialog-actions">
            <Dialog.Close className="button button-primary">Done</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
