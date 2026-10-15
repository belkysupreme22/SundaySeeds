import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { InputField, TextAreaField } from "../../../shared/ui/InputField";
import type { CourseDetails, CourseOutline } from "./useCourseOutlines";

export function CourseDetailsDialog({
  course,
  onSave,
  onClose,
  restoreFocus,
}: {
  course: CourseOutline | null;
  onSave: (details: CourseDetails) => boolean;
  onClose: () => void;
  restoreFocus: () => void;
}) {
  const [title, setTitle] = useState(course?.title ?? "");
  const [summary, setSummary] = useState(course?.summary ?? "");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onSave({ title, summary })) {
      setError("Give your course a title before saving.");
      return;
    }
    onClose();
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
              <p className="eyebrow">Course studio</p>
              <Dialog.Title>
                {course ? "Edit course details" : "Create a course"}
              </Dialog.Title>
            </div>
            <Dialog.Close
              className="icon-button"
              aria-label="Close course details"
            >
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="muted teacher-dialog-description">
            Give your teaching a shared purpose. Add modules and lessons to
            shape the journey.
          </Dialog.Description>
          <form className="form-grid" onSubmit={submit}>
            <label className="field">
              Course title{" "}
              <InputField
                required
                maxLength={100}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="For example, Faith in everyday life"
              />
            </label>
            <label className="field">
              Course summary{" "}
              <TextAreaField
                rows={4}
                maxLength={1000}
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="What will learners explore?"
              />
            </label>
            {error && (
              <p className="teacher-form-error" role="alert">
                {error}
              </p>
            )}
            <div className="dialog-actions">
              <Dialog.Close type="button" className="button button-outline">
                Cancel
              </Dialog.Close>
              <button type="submit" className="button button-primary">
                {course ? "Save changes" : "Create course"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
