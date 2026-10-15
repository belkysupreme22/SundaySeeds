import { useState } from "react";
import { ArrowDown, ArrowUp, BookOpen, Plus, X } from "lucide-react";
import { InputField } from "../../../shared/ui/InputField";
import type {
  CourseOutlineModel,
  CourseModule,
} from "../courses/useCourseOutlines";
import type { LessonDraft } from "../lessons/types";

interface Props {
  model: CourseOutlineModel;
  drafts: LessonDraft[];
  courseId: string | null;
  lessonId: string | null;
  onSelectCourse: (id: string | null) => void;
  onSelectLesson: (id: string) => void;
  onCreateCourse: () => void;
  onCreateLesson: (moduleId?: string) => void;
  onCourseOverview: () => void;
  onTryExample: () => void;
  onRemoveCourse: () => void;
  onRemoveModule: (id: string) => void;
}

function ModuleTree({
  module,
  index,
  total,
  courseId,
  model,
  drafts,
  available,
  lessonId,
  onSelectLesson,
  onCreateLesson,
  onRemoveModule,
}: {
  module: CourseModule;
  index: number;
  total: number;
  courseId: string;
  model: CourseOutlineModel;
  drafts: LessonDraft[];
  available: LessonDraft[];
  lessonId: string | null;
  onSelectLesson: Props["onSelectLesson"];
  onCreateLesson: Props["onCreateLesson"];
  onRemoveModule: Props["onRemoveModule"];
}) {
  const [removing, setRemoving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [unlink, setUnlink] = useState<string | null>(null);
  const [existing, setExisting] = useState("");
  const [error, setError] = useState("");
  const chosen = available.some((draft) => draft.id === existing)
    ? existing
    : "";
  return (
    <section
      className="studio-tree-module"
      aria-label={`Module ${index + 1}: ${module.title}`}
    >
      <div className="studio-tree-module-heading">
        <div>
          <span className="eyebrow">Module {index + 1}</span>
          <h3>{module.title}</h3>
        </div>
        <div className="studio-outline-actions">
          <button
            className="icon-button"
            type="button"
            disabled={index === 0}
            aria-label={`Move ${module.title} up`}
            onClick={() => model.moveModule(courseId, module.id, -1)}
          >
            <ArrowUp size={16} />
          </button>
          <button
            className="icon-button"
            type="button"
            disabled={index === total - 1}
            aria-label={`Move ${module.title} down`}
            onClick={() => model.moveModule(courseId, module.id, 1)}
          >
            <ArrowDown size={16} />
          </button>
          <button
            className="button button-quiet"
            type="button"
            onClick={() => {
              setTitle(module.title);
              setEditing(!editing);
              setError("");
            }}
          >
            {editing ? "Cancel rename" : "Rename"}
          </button>
        </div>
      </div>
      <button className="button button-quiet" onClick={() => setRemoving(true)}>
        Remove module
      </button>
      {removing && (
        <div className="studio-outline-confirm">
          <p>
            Remove this module and its links? Lesson drafts stay in the library.
          </p>
          <button
            className="button button-outline"
            onClick={() => setRemoving(false)}
          >
            Keep module
          </button>
          <button
            className="button button-outline"
            onClick={() => onRemoveModule(module.id)}
          >
            Remove module
          </button>
        </div>
      )}
      {editing && (
        <form
          className="studio-outline-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (model.renameModule(courseId, module.id, title)) {
              setEditing(false);
              setError("");
            } else setError("Enter a module name.");
          }}
        >
          <label>
            Module name
            <InputField
              value={title}
              maxLength={100}
              required
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <button className="button button-secondary" type="submit">
            Save name
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
      )}
      <ol className="studio-tree-lessons">
        {module.lessonIds.map((id, lessonIndex) => {
          const lesson = drafts.find((draft) => draft.id === id);
          return (
            <li key={id} className="studio-tree-lesson">
              <button
                className="studio-tree-select"
                type="button"
                disabled={!lesson}
                aria-current={lessonId === id ? "page" : undefined}
                onClick={() => onSelectLesson(id)}
              >
                <span>
                  {index + 1}.{lessonIndex + 1}
                </span>
                <span>
                  {lesson?.title || "Unavailable lesson"}
                  {lesson?.example && <small className="badge">Sample</small>}
                </span>
              </button>
              <div className="studio-outline-actions">
                <button
                  className="icon-button"
                  type="button"
                  disabled={lessonIndex === 0}
                  aria-label={`Move ${lesson?.title || "lesson"} up`}
                  onClick={() => model.moveLesson(courseId, module.id, id, -1)}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  className="icon-button"
                  type="button"
                  disabled={lessonIndex === module.lessonIds.length - 1}
                  aria-label={`Move ${lesson?.title || "lesson"} down`}
                  onClick={() => model.moveLesson(courseId, module.id, id, 1)}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  className="icon-button"
                  type="button"
                  aria-label={`Remove ${lesson?.title || "lesson"} from module`}
                  onClick={() => setUnlink(id)}
                >
                  <X size={14} />
                </button>
              </div>
              {unlink === id && (
                <div className="studio-outline-confirm">
                  <p>
                    Remove from this module? The lesson stays in your library.
                  </p>
                  <button
                    className="button button-quiet"
                    type="button"
                    onClick={() => setUnlink(null)}
                  >
                    Keep lesson
                  </button>
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => {
                      model.removeLesson(courseId, module.id, id);
                      setUnlink(null);
                    }}
                  >
                    Remove link
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {module.lessonIds.length === 0 && (
        <p className="muted">Add the first lesson in this module.</p>
      )}
      <button
        className="button button-quiet"
        type="button"
        onClick={() => onCreateLesson(module.id)}
      >
        <Plus size={16} />
        New lesson in module
      </button>
      {available.length > 0 && (
        <form
          className="studio-outline-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (chosen) {
              model.attachLesson(courseId, module.id, chosen);
              setExisting("");
            }
          }}
        >
          <label>
            Add from lesson library
            <select
              className="input"
              value={chosen}
              required
              onChange={(event) => setExisting(event.target.value)}
            >
              <option value="">Choose a lesson</option>
              {available.map((draft) => (
                <option key={draft.id} value={draft.id}>
                  {draft.title}
                  {draft.example ? " (sample)" : ""}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button button-secondary"
            type="submit"
            disabled={!chosen}
          >
            Add to module
          </button>
        </form>
      )}
    </section>
  );
}

export function StudioOutline({
  model,
  drafts,
  courseId,
  lessonId,
  onSelectCourse,
  onSelectLesson,
  onCreateCourse,
  onCreateLesson,
  onCourseOverview,
  onTryExample,
  onRemoveCourse,
  onRemoveModule,
}: Props) {
  const [removingCourse, setRemovingCourse] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [error, setError] = useState("");
  const course = model.courses.find((item) => item.id === courseId);
  const used = new Set(
    course?.modules.flatMap((module) => module.lessonIds) ?? [],
  );
  const available = drafts.filter((draft) => !used.has(draft.id));
  return (
    <aside
      className="studio-outline"
      aria-label="Course outline and lesson library"
    >
      <div className="studio-outline-heading">
        <BookOpen size={20} />
        <h2>Your curriculum</h2>
      </div>
      <label className="studio-outline-form">
        Working course
        <select
          className="input"
          value={course?.id ?? ""}
          onChange={(event) => {
            setModuleTitle("");
            setError("");
            onSelectCourse(event.target.value || null);
          }}
        >
          <option value="">Lesson library</option>
          {model.courses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
              {item.example ? " (sample)" : ""}
            </option>
          ))}
        </select>
      </label>
      <button
        className="button button-secondary"
        type="button"
        onClick={onCreateCourse}
      >
        <Plus size={16} />
        New course
      </button>
      {course ? (
        <>
          <button
            className="studio-tree-select studio-course-overview"
            type="button"
            aria-current={!lessonId ? "page" : undefined}
            onClick={onCourseOverview}
          >
            Course overview
            {course.example && <span className="badge">Sample</span>}
          </button>
          <p className="muted">
            Course → modules → lessons. Select a lesson to write, build its
            knowledge check and prepare publication.
          </p>
          <div className="studio-tree">
            {course.modules.map((module, index) => (
              <ModuleTree
                key={module.id}
                module={module}
                index={index}
                total={course.modules.length}
                courseId={course.id}
                model={model}
                drafts={drafts}
                available={available}
                lessonId={lessonId}
                onSelectLesson={onSelectLesson}
                onCreateLesson={onCreateLesson}
                onRemoveModule={onRemoveModule}
              />
            ))}
          </div>
          <form
            className="studio-outline-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (model.addModule(course.id, moduleTitle)) {
                setModuleTitle("");
                setError("");
              } else setError("Enter a module name.");
            }}
          >
            <label>
              New module
              <InputField
                value={moduleTitle}
                onChange={(event) => setModuleTitle(event.target.value)}
                required
                maxLength={100}
                placeholder="e.g. Practising everyday kindness"
              />
            </label>
            <button className="button button-secondary" type="submit">
              <Plus size={16} />
              Add module
            </button>
            {error && <p role="alert">{error}</p>}
          </form>
          <button
            className="button button-quiet"
            onClick={() => setRemovingCourse(true)}
          >
            Remove course outline
          </button>
          {removingCourse && (
            <div className="studio-outline-confirm">
              <p>
                Remove this course outline? All lesson drafts remain in the
                library.
              </p>
              <button
                className="button button-outline"
                onClick={() => setRemovingCourse(false)}
              >
                Keep course
              </button>
              <button
                className="button button-outline"
                onClick={() => {
                  setRemovingCourse(false);
                  onRemoveCourse();
                }}
              >
                Remove outline
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="studio-outline-intro">
          <p>
            Build a complete course by grouping lessons into modules. Or start
            writing in your lesson library.
          </p>
          <button
            className="button button-quiet"
            type="button"
            onClick={onTryExample}
          >
            Try an example course
          </button>
        </div>
      )}
      <section className="studio-library" aria-label="Lesson library">
        <div className="studio-outline-heading">
          <h3>{course ? "Outside this course" : "Lesson library"}</h3>
          <span className="badge">{available.length}</span>
        </div>
        {available.map((draft) => (
          <button
            className="studio-tree-select"
            type="button"
            key={draft.id}
            aria-current={lessonId === draft.id ? "page" : undefined}
            onClick={() => onSelectLesson(draft.id)}
          >
            <span>{draft.title}</span>
            {draft.example && <span className="badge">Sample</span>}
          </button>
        ))}
        {!available.length && (
          <p className="muted">
            {course
              ? "All library lessons are in this course."
              : "Your first lesson starts here."}
          </p>
        )}
        <button
          className="button button-quiet"
          type="button"
          onClick={() => onCreateLesson()}
        >
          <Plus size={16} />
          New library lesson
        </button>
      </section>
    </aside>
  );
}
