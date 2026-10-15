import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Eye,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { InputField } from "../../../shared/ui/InputField";
import type { LessonDraft } from "../DraftEditor";
import type { CourseModule, MoveDirection } from "./useCourseOutlines";

function OrderControls({
  label,
  first,
  last,
  onMove,
}: {
  label: string;
  first: boolean;
  last: boolean;
  onMove: (direction: MoveDirection) => void;
}) {
  return (
    <div className="course-order-controls">
      <button
        type="button"
        className="icon-button"
        disabled={first}
        aria-label={`Move ${label} up`}
        onClick={() => onMove(-1)}
      >
        <ArrowUp size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="icon-button"
        disabled={last}
        aria-label={`Move ${label} down`}
        onClick={() => onMove(1)}
      >
        <ArrowDown size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export function CourseModuleCard({
  module,
  index,
  total,
  drafts,
  available,
  onRename,
  onRemove,
  onMove,
  onAttach,
  onDetach,
  onMoveLesson,
  onPreview,
  onOpenLessons,
  onCreateLesson,
}: {
  module: CourseModule;
  index: number;
  total: number;
  drafts: LessonDraft[];
  available: LessonDraft[];
  onRename: (title: string) => boolean;
  onRemove: () => void;
  onMove: (direction: MoveDirection) => void;
  onAttach: (lessonId: string) => void;
  onDetach: (lessonId: string) => void;
  onMoveLesson: (lessonId: string, direction: MoveDirection) => void;
  onPreview: (draft: LessonDraft, trigger: HTMLButtonElement) => void;
  onOpenLessons: () => void;
  onCreateLesson: (trigger: HTMLButtonElement) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [lessonId, setLessonId] = useState("");
  const [error, setError] = useState("");
  const selectedLesson = available.some((draft) => draft.id === lessonId)
    ? lessonId
    : "";

  function rename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onRename(title)) {
      setError("A module needs a title.");
      return;
    }
    setEditing(false);
    setError("");
  }

  function attach(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLesson) {
      setError("Choose a lesson draft to add.");
      return;
    }
    onAttach(selectedLesson);
    setLessonId("");
    setError("");
  }

  return (
    <li className="course-module">
      <div className="course-module-header">
        <div className="course-module-title">
          <p className="eyebrow">Module {index + 1}</p>
          <h3>{module.title}</h3>
          <p className="course-meta">
            {module.lessonIds.length}{" "}
            {module.lessonIds.length === 1 ? "lesson" : "lessons"}
          </p>
        </div>
        <OrderControls
          label={`module ${module.title}`}
          first={index === 0}
          last={index === total - 1}
          onMove={onMove}
        />
        <div className="course-actions">
          <button
            type="button"
            className="icon-button"
            aria-label={`Rename module ${module.title}`}
            onClick={() => {
              setTitle(module.title);
              setEditing(true);
              setConfirmRemove(false);
              setError("");
            }}
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label={`Remove module ${module.title}`}
            onClick={() => {
              setConfirmRemove(true);
              setEditing(false);
              setError("");
            }}
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      {editing && (
        <form className="course-inline-form" onSubmit={rename}>
          <label className="field">
            Module title
            <InputField
              required
              maxLength={100}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <button type="submit" className="button button-primary">
            Save title
          </button>
          <button
            type="button"
            className="button button-outline"
            onClick={() => {
              setEditing(false);
              setError("");
            }}
          >
            Cancel
          </button>
        </form>
      )}
      {confirmRemove && (
        <div className="course-confirm">
          <p>
            Remove “{module.title}” and its lesson links from this course? Your
            lesson drafts will stay in Lessons.
          </p>
          <div className="course-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() => setConfirmRemove(false)}
            >
              Keep module
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={onRemove}
            >
              Remove module
            </button>
          </div>
        </div>
      )}
      {module.lessonIds.length ? (
        <ol className="course-lesson-list">
          {module.lessonIds.map((id, lessonIndex) => {
            const lesson = drafts.find((draft) => draft.id === id);
            const label = lesson?.title ?? "Unavailable lesson";
            return (
              <li className="course-lesson-row" key={id}>
                <BookOpen size={19} aria-hidden="true" />
                <div className="course-lesson-copy">
                  <p className="eyebrow">
                    {index + 1}.{lessonIndex + 1} ·{" "}
                    {lesson?.example ? "Example lesson" : "Draft lesson"}
                  </p>
                  <h4>{label}</h4>
                  {lesson?.scripture && (
                    <p className="course-meta">{lesson.scripture}</p>
                  )}
                </div>
                <OrderControls
                  label={`lesson ${label}`}
                  first={lessonIndex === 0}
                  last={lessonIndex === module.lessonIds.length - 1}
                  onMove={(direction) => onMoveLesson(id, direction)}
                />
                <div className="course-actions">
                  {lesson && (
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Preview ${label}`}
                      onClick={(event) =>
                        onPreview(lesson, event.currentTarget)
                      }
                    >
                      <Eye size={17} aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Remove ${label} from module`}
                    onClick={() => onDetach(id)}
                  >
                    <X size={17} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="course-empty muted">Add a lesson to begin this module.</p>
      )}
      {available.length ? (
        <form className="course-inline-form" onSubmit={attach}>
          <label className="field">
            Choose an existing lesson
            <select
              className="input"
              required
              value={selectedLesson}
              onChange={(event) => setLessonId(event.target.value)}
            >
              <option value="">Choose a lesson</option>
              {available.map((draft) => (
                <option key={draft.id} value={draft.id}>
                  {draft.title}
                  {draft.example ? " (example)" : ""}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="button button-outline">
            <Plus size={17} aria-hidden="true" />
            Add lesson
          </button>
        </form>
      ) : (
        <p className="course-empty muted">
          {drafts.length
            ? "All your existing lessons are already in this course. Create another below."
            : "No lesson drafts yet. Create your first one below."}
        </p>
      )}
      <div className="course-inline-form">
        <div className="field">
          <strong>Create a lesson in this module</strong>
          <p className="muted">
            It will be added to “{module.title}” automatically.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={(event) => onCreateLesson(event.currentTarget)}
        >
          <Plus size={17} aria-hidden="true" />
          Create lesson
        </button>
        <button
          type="button"
          className="button button-outline"
          onClick={onOpenLessons}
        >
          Lesson library
        </button>
      </div>
      {error && (
        <p className="teacher-form-error" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}
