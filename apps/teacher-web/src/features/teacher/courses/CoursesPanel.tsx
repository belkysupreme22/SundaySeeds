import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { InputField } from "../../../shared/ui/InputField";
import type { LessonDraft } from "../DraftEditor";
import { CourseDetailsDialog } from "./CourseDetailsDialog";
import { CourseModuleCard } from "./CourseModuleCard";
import { CourseFlowGuide } from "./CourseFlowGuide";
import type { CourseOutlineModel, CourseOutline } from "./useCourseOutlines";
import "./courses.css";

export function CoursesPanel({
  model,
  drafts,
  onPreview,
  onEdit,
  onOpenLessons,
  onCreateLesson,
  onTryExample,
}: {
  model: CourseOutlineModel;
  drafts: LessonDraft[];
  onPreview: (draft: LessonDraft, trigger: HTMLButtonElement) => void;
  onEdit: (draft: LessonDraft, trigger: HTMLButtonElement) => void;
  onOpenLessons: () => void;
  onCreateLesson: (
    courseId: string,
    moduleId: string,
    trigger: HTMLButtonElement,
  ) => void;
  onTryExample: () => void;
}) {
  const [editor, setEditor] = useState<{ course: CourseOutline | null } | null>(
    null,
  );
  const [moduleTitle, setModuleTitle] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const course = model.courses.find((item) => item.id === model.selectedId);
  const used = new Set(
    course?.modules.flatMap((module) => module.lessonIds) ?? [],
  );
  const available = drafts.filter((draft) => !used.has(draft.id));

  function openEditor(item: CourseOutline | null, trigger: HTMLButtonElement) {
    openerRef.current = trigger;
    setEditor({ course: item });
  }

  function restoreFocus() {
    if (openerRef.current?.isConnected) openerRef.current.focus();
    else headingRef.current?.focus();
  }

  function addModule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!course || !model.addModule(course.id, moduleTitle)) {
      setError("Give your module a title.");
      return;
    }
    setStatus(`Module “${moduleTitle.trim()}” added.`);
    setModuleTitle("");
    setError("");
  }

  function selectCourse(id: string | null) {
    model.selectCourse(id);
    setModuleTitle("");
    setError("");
    setStatus("");
    setConfirmRemove(false);
  }

  return (
    <section className="course-workspace" aria-label="Course outlines">
      <div className="course-toolbar">
        <div>
          <p className="eyebrow">Course studio</p>
          <h2 tabIndex={-1} ref={headingRef}>
            {course ? "Shape the learning journey" : "Your courses"}
          </h2>
        </div>
        {course ? (
          <button
            type="button"
            className="button button-outline course-back"
            onClick={() => selectCourse(null)}
          >
            <ArrowLeft size={17} aria-hidden="true" />
            All courses
          </button>
        ) : (
          <button
            type="button"
            className="button button-primary"
            onClick={(event) => openEditor(null, event.currentTarget)}
          >
            <Plus size={18} aria-hidden="true" />
            Create a course
          </button>
        )}
      </div>
      <CourseFlowGuide
        hasCourse={Boolean(course)}
        hasModules={Boolean(course?.modules.length)}
        hasLessons={Boolean(
          course?.modules.length &&
          course.modules.every((module) => module.lessonIds.length > 0),
        )}
        onTryExample={() => {
          onTryExample();
          setModuleTitle("");
          setError("");
          setConfirmRemove(false);
          setStatus(
            "Example course opened. You can edit the modules and sample lessons, or change their order.",
          );
        }}
      />
      {!course &&
        (model.courses.length ? (
          <div className="course-library">
            {model.courses.map((item) => (
              <article key={item.id} className="panel course-card">
                <span className="teacher-icon-tile tone-lavender">
                  <Layers size={25} aria-hidden="true" />
                </span>
                <span className="badge">
                  {item.example ? "Example course" : "Draft course"}
                </span>
                <h3>{item.title}</h3>
                <p className="muted course-summary-copy">
                  {item.summary || "Add a summary to introduce this course."}
                </p>
                <p className="course-meta">
                  {item.modules.length} modules ·{" "}
                  {item.modules.reduce(
                    (sum, module) => sum + module.lessonIds.length,
                    0,
                  )}{" "}
                  lessons
                </p>
                <button
                  type="button"
                  className="button button-outline"
                  aria-label={`Open outline for ${item.title}`}
                  onClick={() => selectCourse(item.id)}
                >
                  Open outline
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel empty-state teacher-empty">
            <span className="teacher-icon-tile tone-mint">
              <Layers size={27} aria-hidden="true" />
            </span>
            <h3>A meaningful journey starts here</h3>
            <p className="muted">
              Bring your lessons together in a course. Use modules to give each
              step a clear purpose.
            </p>
            <button
              type="button"
              className="button button-outline"
              onClick={(event) => openEditor(null, event.currentTarget)}
            >
              Create your first course
            </button>
          </div>
        ))}
      {course && (
        <>
          <div className="panel tone-lavender course-summary">
            <div>
              <span className="badge">
                {course.example ? "Example course" : "Draft course"}
              </span>
              <h3>{course.title}</h3>
              <p className="course-summary-copy">
                {course.summary ||
                  "Add a summary to help learners know what to expect."}
              </p>
              <p className="course-meta">
                {course.modules.length} modules · {used.size} lessons · Not
                published
              </p>
            </div>
            <div className="course-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={(event) => openEditor(course, event.currentTarget)}
              >
                <Pencil size={16} aria-hidden="true" />
                Edit details
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label={`Remove course ${course.title}`}
                onClick={() => setConfirmRemove(true)}
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
          {confirmRemove && (
            <div className="course-confirm">
              <h3>Remove this course outline?</h3>
              <p>
                Its modules and lesson links will be removed. Your lesson drafts
                will stay in Lessons.
              </p>
              <div className="course-actions">
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setConfirmRemove(false)}
                >
                  Keep course
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => {
                    model.removeCourse(course.id);
                    setConfirmRemove(false);
                    setModuleTitle("");
                    setStatus("Course outline removed. Lesson drafts kept.");
                    headingRef.current?.focus();
                  }}
                >
                  Remove course
                </button>
              </div>
            </div>
          )}
          <div className="course-toolbar">
            <div>
              <p className="eyebrow">Curriculum</p>
              <h3>Your course outline</h3>
            </div>
            <span className="course-meta">
              <BookOpen size={16} aria-hidden="true" /> Arrange lessons in the
              order learners will see them
            </span>
          </div>
          {course.modules.length ? (
            <ol className="course-outline">
              {course.modules.map((module, index) => (
                <CourseModuleCard
                  key={module.id}
                  module={module}
                  index={index}
                  total={course.modules.length}
                  drafts={drafts}
                  available={available}
                  onRename={(title) => {
                    const saved = model.renameModule(
                      course.id,
                      module.id,
                      title,
                    );
                    if (saved) setStatus("Module title updated.");
                    return saved;
                  }}
                  onRemove={() => {
                    model.removeModule(course.id, module.id);
                    setStatus("Module removed. Lesson drafts kept.");
                    headingRef.current?.focus();
                  }}
                  onMove={(direction) => {
                    model.moveModule(course.id, module.id, direction);
                    setStatus(
                      `${module.title} moved ${direction < 0 ? "up" : "down"}.`,
                    );
                  }}
                  onAttach={(id) => {
                    model.attachLesson(course.id, module.id, id);
                    setStatus("Lesson added to module.");
                  }}
                  onDetach={(id) => {
                    model.removeLesson(course.id, module.id, id);
                    setStatus(
                      "Lesson removed from module; draft kept in Lessons.",
                    );
                  }}
                  onMoveLesson={(id, direction) => {
                    model.moveLesson(course.id, module.id, id, direction);
                    setStatus(`Lesson moved ${direction < 0 ? "up" : "down"}.`);
                  }}
                  onPreview={onPreview}
                  onEdit={onEdit}
                  onOpenLessons={onOpenLessons}
                  onCreateLesson={(trigger) =>
                    onCreateLesson(course.id, module.id, trigger)
                  }
                />
              ))}
            </ol>
          ) : (
            <p className="panel course-empty muted">
              No modules yet. Start with the first theme you want to explore.
            </p>
          )}
          <form className="panel course-inline-form" onSubmit={addModule}>
            <label className="field">
              New module
              <InputField
                required
                maxLength={100}
                placeholder="For example, Loving your neighbour"
                value={moduleTitle}
                onChange={(event) => setModuleTitle(event.target.value)}
              />
            </label>
            <button type="submit" className="button button-primary">
              <Plus size={17} aria-hidden="true" />
              Add module
            </button>
          </form>
          {error && (
            <p className="teacher-form-error" role="alert">
              {error}
            </p>
          )}
        </>
      )}
      <p className="course-status" role="status">
        {status}
      </p>
      {editor && (
        <CourseDetailsDialog
          course={editor.course}
          onSave={(details) => {
            const saved = model.saveCourse(details, editor.course?.id);
            if (saved)
              setStatus(
                editor.course
                  ? "Course details updated."
                  : "Course created. Add your first module.",
              );
            return saved;
          }}
          onClose={() => setEditor(null)}
          restoreFocus={restoreFocus}
        />
      )}
    </section>
  );
}
