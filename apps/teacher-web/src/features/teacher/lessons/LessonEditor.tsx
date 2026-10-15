import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, Eye, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { InputField, TextAreaField } from "../../../shared/ui/InputField";
import { LessonSectionsEditor } from "./LessonSectionsEditor";
import { LessonImageField } from "./LessonImageField";
import { LessonContentPreview } from "./LessonPreview";
import { QuizBuilder } from "../quizzes/QuizBuilder";
import { getQuizIssues } from "../quizzes/types";
import type { LessonContent, LessonDraft } from "./types";
import "./lesson-authoring.css";

interface LessonEditorProps {
  draft: LessonDraft | null;
  destination?: string;
  onSave: (draft: LessonContent) => void;
  onClose: () => void;
  restoreFocus: () => void;
}

export function LessonEditor({
  draft,
  destination,
  onSave,
  onClose,
  restoreFocus,
}: LessonEditorProps) {
  const [content, setContent] = useState<LessonContent>(() => ({
    title: draft?.title ?? "",
    scripture: draft?.scripture ?? "",
    outcomes: draft?.outcomes ?? [],
    sections: draft?.sections ?? [{ id: "reading-1", title: "", body: "" }],
    reflection: draft?.reflection ?? "",
    image: draft?.image,
    quiz: draft?.quiz ?? [],
  }));
  const [initial] = useState(() => JSON.stringify(content));
  const [outcomesText, setOutcomesText] = useState(content.outcomes.join("\n"));
  const [previewing, setPreviewing] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);
  const keepEditingRef = useRef<HTMLButtonElement>(null);
  function update<K extends keyof LessonContent>(
    key: K,
    value: LessonContent[K],
  ) {
    setContent((current) => ({ ...current, [key]: value }));
    setError("");
  }
  function requestClose() {
    if (imageBusy || JSON.stringify(content) !== initial) {
      setDiscarding(true);
      requestAnimationFrame(() => keepEditingRef.current?.focus());
    } else onClose();
  }
  function showError(message: string) {
    setError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (imageBusy) return;
    if (!content.title.trim()) {
      showError("Give your lesson a title.");
      return;
    }
    const incomplete = content.sections.findIndex(
      (section) => !section.title.trim() || !section.body.trim(),
    );
    if (!content.sections.length || incomplete >= 0) {
      showError(
        `Add a heading and reading to section ${Math.max(0, incomplete) + 1}.`,
      );
      return;
    }
    const outcomes = content.outcomes
      .map((item) => item.trim())
      .filter(Boolean);
    if (outcomes.length > 6 || outcomes.some((item) => item.length > 200)) {
      showError(
        "Use up to six learning outcomes, with no more than 200 characters each.",
      );
      return;
    }
    if (content.image && !content.image.alt.trim()) {
      showError(
        "Describe the cover image so learners using a screen reader can understand it.",
      );
      return;
    }
    const quizIssues = getQuizIssues(content.quiz ?? []);
    if (quizIssues.length) {
      showError(quizIssues[0]);
      return;
    }
    onSave({
      ...content,
      title: content.title.trim(),
      scripture: content.scripture.trim(),
      outcomes,
      sections: content.sections.map((section) => ({
        ...section,
        title: section.title.trim(),
        body: section.body.trim(),
      })),
      reflection: content.reflection.trim(),
      quiz: (content.quiz ?? []).map((question) => ({
        ...question,
        prompt: question.prompt.trim(),
        options: question.options.map((option) => ({
          ...option,
          text: option.text.trim(),
        })),
        explanation: question.explanation.trim(),
      })),
      image: content.image
        ? { ...content.image, alt: content.image.alt.trim() }
        : undefined,
    });
  }
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="dialog-content teacher-dialog lesson-authoring-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restoreFocus();
          }}
        >
          <div className="dialog-header">
            <div>
              <p className="eyebrow">
                Lesson studio{draft?.example ? " · Example content" : ""}
              </p>
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
            {destination
              ? `Build a lesson for “${destination}”. Saving adds it to this module automatically.`
              : "Set learning outcomes, shape the reading and invite reflection."}
          </Dialog.Description>
          {discarding && (
            <div className="lesson-discard" role="alert">
              <strong>Discard your unsaved changes?</strong>
              <p>
                {draft
                  ? "Your saved lesson will stay as it was."
                  : "This new lesson has not been saved."}
              </p>
              <div className="lesson-editor-actions">
                <button
                  ref={keepEditingRef}
                  type="button"
                  className="button button-outline"
                  onClick={() => setDiscarding(false)}
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={onClose}
                >
                  Discard changes
                </button>
              </div>
            </div>
          )}
          <div className="lesson-editor-heading">
            <span className="badge tone-lavender">
              {previewing
                ? "Learner preview · Unsaved"
                : "Lesson details → Reading → Reflection → Knowledge check"}
            </span>
            <button
              type="button"
              className="button button-outline"
              disabled={imageBusy}
              onClick={() => {
                setPreviewing((current) => !current);
                setError("");
              }}
            >
              {previewing ? (
                <ArrowLeft size={17} aria-hidden="true" />
              ) : (
                <Eye size={17} aria-hidden="true" />
              )}
              {previewing ? "Back to editing" : "Preview lesson"}
            </button>
          </div>
          {previewing ? (
            <LessonContentPreview content={content} />
          ) : (
            <form
              className="teacher-editor-form lesson-authoring-form"
              onSubmit={submit}
            >
              <section
                className="lesson-editor-group"
                aria-labelledby="lesson-details-heading"
              >
                <div>
                  <p className="eyebrow">01 · Lesson details</p>
                  <h3 id="lesson-details-heading">
                    Give the lesson a clear purpose
                  </h3>
                </div>
                <label className="field">
                  Lesson title{" "}
                  <InputField
                    autoFocus
                    required
                    maxLength={100}
                    value={content.title}
                    onChange={(event) => update("title", event.target.value)}
                    placeholder="Give your lesson a clear title"
                  />
                </label>
                <label className="field">
                  Scripture reference{" "}
                  <InputField
                    maxLength={100}
                    value={content.scripture}
                    onChange={(event) =>
                      update("scripture", event.target.value)
                    }
                    placeholder="For example, Luke 10:25–37"
                  />
                </label>
                <label className="field">
                  What will learners learn?{" "}
                  <TextAreaField
                    rows={3}
                    maxLength={1206}
                    value={outcomesText}
                    onChange={(event) => {
                      setOutcomesText(event.target.value);
                      update("outcomes", event.target.value.split("\n"));
                    }}
                    placeholder={
                      "Recognise compassion in everyday situations\nChoose one practical way to help a neighbour"
                    }
                  />
                  <span className="muted teacher-form-note">
                    Optional · One outcome per line, up to six. Maximum 200
                    characters each.
                  </span>
                </label>
                <LessonImageField
                  image={content.image}
                  onChange={(image) => update("image", image)}
                  onBusyChange={setImageBusy}
                />
              </section>
              <LessonSectionsEditor
                sections={content.sections}
                onChange={(sections) => update("sections", sections)}
              />
              <section
                className="lesson-editor-group lesson-reflection-editor"
                aria-labelledby="lesson-reflection-heading"
              >
                <div>
                  <p className="eyebrow">03 · Reflection</p>
                  <h3 id="lesson-reflection-heading">
                    Bring it into everyday life
                  </h3>
                </div>
                <label className="field">
                  Reflection question
                  <TextAreaField
                    rows={3}
                    maxLength={500}
                    value={content.reflection}
                    onChange={(event) =>
                      update("reflection", event.target.value)
                    }
                    placeholder="What could this look like in your week?"
                  />
                </label>
              </section>
              <QuizBuilder
                questions={content.quiz ?? []}
                onChange={(questions) => update("quiz", questions)}
              />
              {error && (
                <p
                  ref={errorRef}
                  tabIndex={-1}
                  className="teacher-form-error"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <p className="muted teacher-form-note">
                Save this draft to keep your changes during this page session.
                Publishing is the next step in the plan.
              </p>
              <div className="dialog-actions">
                <Dialog.Close className="button button-outline" type="button">
                  Cancel
                </Dialog.Close>
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={imageBusy}
                >
                  {destination ? "Save and add to module" : "Save lesson draft"}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
