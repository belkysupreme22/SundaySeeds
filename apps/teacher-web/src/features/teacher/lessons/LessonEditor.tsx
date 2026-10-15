import { ArrowLeft, Eye, Save } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
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
  restoreFocus?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export function LessonEditor({
  draft,
  destination,
  onSave,
  onClose,
  onDirtyChange,
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
  const [initial, setInitial] = useState(() => JSON.stringify(content));
  const [section, setSection] = useState("details");
  const [savedOnce, setSavedOnce] = useState(Boolean(draft));
  const formId = useId();
  const [outcomesText, setOutcomesText] = useState(content.outcomes.join("\n"));
  const [previewing, setPreviewing] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);
  const keepEditingRef = useRef<HTMLButtonElement>(null);
  const dirty = imageBusy || JSON.stringify(content) !== initial;
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
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
  function showError(message: string, target = "details") {
    setPreviewing(false);
    setSection(target);
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
        "reading",
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
      showError(quizIssues[0], "quiz");
      return;
    }
    const saved: LessonContent = {
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
    };
    setContent(saved);
    setOutcomesText(saved.outcomes.join("\n"));
    setInitial(JSON.stringify(saved));
    setSavedOnce(true);
    onDirtyChange?.(false);
    onSave(saved);
  }
  return (
    <section className="lesson-editor-studio" aria-label="Lesson editor">
      <div className="lesson-studio-header">
        <div>
          <p className="eyebrow">
            Lesson studio{draft?.example ? " · Example content" : ""}
          </p>
          <h2>{content.title.trim() || "Untitled lesson"}</h2>
          <p className="lesson-editor-status" role="status">
            {imageBusy
              ? "Preparing image…"
              : dirty
                ? "Unsaved changes"
                : savedOnce
                  ? "Draft saved for this session"
                  : "New lesson · Save when ready"}
          </p>
        </div>
        <div className="lesson-editor-actions">
          <button
            type="button"
            className="button button-outline"
            onClick={requestClose}
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Back to course
          </button>
          <button
            className="button button-primary"
            type="submit"
            form={formId}
            disabled={imageBusy}
          >
            <Save size={17} aria-hidden="true" />
            {destination ? "Save and add to module" : "Save draft"}
          </button>
        </div>
      </div>
      <p className="muted teacher-dialog-description">
        {destination
          ? `Build a lesson for “${destination}”. Saving adds it to this module automatically.`
          : "Set learning outcomes, shape the reading and invite reflection."}
      </p>
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
            ? dirty
              ? "Learner preview · Unsaved changes"
              : "Learner preview"
            : "Shape a complete lesson, one section at a time"}
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
      {previewing && <LessonContentPreview content={content} />}
      <div hidden={previewing}>
        <nav className="lesson-section-nav" aria-label="Lesson sections">
          {[
            ["details", "01", "Details"],
            ["reading", "02", "Reading"],
            ["reflection", "03", "Reflection"],
            ["quiz", "04", "Quiz"],
          ].map(([id, number, label]) => (
            <button
              key={id}
              type="button"
              aria-current={section === id ? "step" : undefined}
              className={section === id ? "is-active" : ""}
              onClick={() => {
                setSection(id);
                setError("");
              }}
            >
              <span>{number}</span>
              {label}
            </button>
          ))}
        </nav>
        <form
          id={formId}
          noValidate
          className="teacher-editor-form lesson-authoring-form"
          onSubmit={submit}
        >
          <section
            hidden={section !== "details"}
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
                onChange={(event) => update("scripture", event.target.value)}
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
          <div hidden={section !== "reading"}>
            <LessonSectionsEditor
              sections={content.sections}
              onChange={(sections) => update("sections", sections)}
            />
          </div>
          <section
            hidden={section !== "reflection"}
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
                onChange={(event) => update("reflection", event.target.value)}
                placeholder="What could this look like in your week?"
              />
            </label>
          </section>
          <div hidden={section !== "quiz"}>
            <QuizBuilder
              questions={content.quiz ?? []}
              onChange={(questions) => update("quiz", questions)}
            />
          </div>
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
        </form>
      </div>
    </section>
  );
}
