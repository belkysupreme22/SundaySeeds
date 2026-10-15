import { ArrowLeft, BookOpen, Copy, LayoutPanelLeft, Plus } from "lucide-react";
import { useState } from "react";
import type { CourseOutlineModel } from "../courses/useCourseOutlines";
import type { LessonContent, LessonDraft } from "../lessons/types";
import { LessonEditor } from "../lessons/LessonEditor";
import { LessonContentPreview } from "../lessons/LessonPreview";
import { PublicationDialog } from "../publication/PublicationDialog";
import { cloneLesson, publicationLabel } from "../publication/publicationModel";
import type { useLessonPublications } from "../publication/useLessonPublications";
import { CourseBrief } from "./CourseBrief";
import { CourseReview } from "./CourseReview";
import { StudioOutline } from "./StudioOutline";
import type { StudioEntry } from "./types";
import "./studio.css";

interface EditorialStudioProps {
  entry: StudioEntry;
  model: CourseOutlineModel;
  drafts: LessonDraft[];
  publications: ReturnType<typeof useLessonPublications>;
  onSave: (
    content: LessonContent,
    id?: string,
    example?: boolean,
  ) => LessonDraft;
  onTryExample: () => void;
  onClose: () => void;
}

export function EditorialStudio({
  entry,
  model,
  drafts,
  publications,
  onSave,
  onTryExample,
  onClose,
}: EditorialStudioProps) {
  const containingCourse = model.courses.find((course) =>
    course.modules.some((module) =>
      module.lessonIds.includes(entry.lessonId ?? ""),
    ),
  );
  const [courseId, setCourseId] = useState<string | null>(
    entry.courseId ?? containingCourse?.id ?? model.selectedId ?? null,
  );
  const [lessonId, setLessonId] = useState<string | null>(
    entry.lessonId ?? null,
  );
  const [moduleId, setModuleId] = useState<string | undefined>(entry.moduleId);
  const [view, setView] = useState<StudioEntry["mode"]>(entry.mode);
  const [courseTab, setCourseTab] = useState<"brief" | "review">("review");
  const [dirty, setDirty] = useState(false);
  const [revision, setRevision] = useState(0);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [outlineVisible, setOutlineVisible] = useState(true);
  const [status, setStatus] = useState("");
  const course = model.courses.find((item) => item.id === courseId);
  const lesson = drafts.find((item) => item.id === lessonId);
  const module = course?.modules.find((item) => item.id === moduleId);
  function navigate(action: () => void) {
    if (dirty) setPending(() => action);
    else action();
  }
  function openLesson(id: string, mode: StudioEntry["mode"] = "edit") {
    navigate(() => {
      setLessonId(id);
      setModuleId(undefined);
      setView(
        publications.get(id).archived && mode === "edit" ? "publish" : mode,
      );
      setDirty(false);
      setStatus("");
    });
  }
  function openCourse(id: string | null) {
    navigate(() => {
      setCourseId(id);
      model.selectCourse(id);
      setLessonId(null);
      setModuleId(undefined);
      setView("course");
      setCourseTab("review");
      setDirty(false);
      setStatus("");
    });
  }
  function createLesson(targetModule?: string) {
    navigate(() => {
      setLessonId(null);
      setModuleId(targetModule);
      setView("edit");
      setDirty(false);
      setStatus("");
    });
  }
  function newCourse() {
    navigate(() => {
      setLessonId(null);
      setView("new-course");
      setDirty(false);
      setStatus("");
    });
  }
  function saveLesson(content: LessonContent) {
    const saved = onSave(content, lessonId ?? undefined, lesson?.example);
    if (course && moduleId && !lessonId)
      model.attachLesson(course.id, moduleId, saved.id);
    setLessonId(saved.id);
    setDirty(false);
    setStatus(
      "Draft saved for this session. Keep shaping the course or review its publication.",
    );
  }
  function duplicateLesson() {
    if (!lesson) return;
    navigate(() => {
      const saved = onSave(
        {
          ...cloneLesson(lesson),
          title: `${lesson.title.slice(0, 90)} (copy)`,
        },
        undefined,
        lesson.example,
      );
      const parent = course?.modules.find((item) =>
        item.lessonIds.includes(lesson.id),
      );
      if (course && parent) model.attachLesson(course.id, parent.id, saved.id);
      setLessonId(saved.id);
      setView("edit");
      setDirty(false);
      setStatus(
        "A separate draft copy was created. Publication history was not copied.",
      );
    });
  }
  function tryExample() {
    navigate(() => {
      onTryExample();
      setCourseId("sample-faith-course");
      setLessonId(null);
      setView("course");
      setCourseTab("review");
      setDirty(false);
    });
  }
  const courseView = view === "course" || view === "new-course";
  return (
    <div className="editorial-studio">
      <header className="studio-header">
        <div>
          <p className="eyebrow">SundaySeeds · Editorial studio</p>
          <h1>
            {view === "new-course"
              ? "New course"
              : (course?.title ?? "A thoughtful course starts here")}
          </h1>
          <p className="muted">
            {course
              ? "Course outline / " +
                (lesson?.title ??
                  (view === "edit" ? "New lesson" : "Course planning"))
              : "Plan the journey. Write the lessons. Shape the whole course."}
          </p>
        </div>
        <div className="studio-toolbar">
          <button
            className="button button-outline"
            onClick={() => setOutlineVisible((current) => !current)}
            aria-pressed={outlineVisible}
          >
            <LayoutPanelLeft size={17} aria-hidden="true" />
            {outlineVisible ? "Focus writing" : "Show outline"}
          </button>
          <button
            className="button button-outline"
            onClick={() => navigate(onClose)}
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Dashboard
          </button>
        </div>
      </header>
      {pending && (
        <div className="studio-unsaved" role="alert">
          <div>
            <strong>Keep your unsaved work?</strong>
            <p>
              Return to the editor to save, or discard these edits before
              switching.
            </p>
          </div>
          <button
            className="button button-outline"
            onClick={() => setPending(null)}
          >
            Keep editing
          </button>
          <button
            className="button button-primary"
            onClick={() => {
              const action = pending;
              setPending(null);
              setDirty(false);
              setRevision((current) => current + 1);
              action();
            }}
          >
            Discard and continue
          </button>
        </div>
      )}
      <div className={`studio-layout${outlineVisible ? "" : " is-focused"}`}>
        {outlineVisible && (
          <aside className="studio-sidebar">
            <StudioOutline
              model={model}
              drafts={drafts}
              courseId={courseId}
              lessonId={lessonId}
              onSelectCourse={openCourse}
              onSelectLesson={openLesson}
              onCreateCourse={newCourse}
              onCreateLesson={createLesson}
              onCourseOverview={() =>
                navigate(() => {
                  setView("course");
                  setCourseTab("review");
                  setLessonId(null);
                })
              }
              onTryExample={tryExample}
              onRemoveCourse={() =>
                navigate(() => {
                  if (course) model.removeCourse(course.id);
                  setCourseId(null);
                  setLessonId(null);
                  setView("course");
                  setCourseTab("review");
                  setDirty(false);
                })
              }
              onRemoveModule={(id) =>
                navigate(() => {
                  if (course) model.removeModule(course.id, id);
                  setModuleId(undefined);
                  setLessonId(null);
                  setView("course");
                  setCourseTab("review");
                  setDirty(false);
                })
              }
            />
          </aside>
        )}
        <div className="studio-canvas" aria-label="Editorial canvas">
          <div className="studio-canvas-toolbar">
            {courseView ? (
              <nav className="studio-mode-nav" aria-label="Course tools">
                <button
                  aria-current={
                    courseTab === "brief" || view === "new-course"
                      ? "page"
                      : undefined
                  }
                  onClick={() =>
                    navigate(() => {
                      setCourseTab("brief");
                      if (view !== "new-course") setView("course");
                    })
                  }
                >
                  Course brief
                </button>
                <button
                  disabled={!course || view === "new-course"}
                  aria-current={
                    courseTab === "review" && view === "course"
                      ? "page"
                      : undefined
                  }
                  onClick={() =>
                    navigate(() => {
                      setCourseTab("review");
                      setView("course");
                    })
                  }
                >
                  Course review
                </button>
              </nav>
            ) : (
              <nav className="studio-mode-nav" aria-label="Lesson tools">
                <button
                  aria-current={view === "edit" ? "page" : undefined}
                  disabled={Boolean(
                    lesson && publications.get(lesson.id).archived,
                  )}
                  onClick={() => navigate(() => setView("edit"))}
                >
                  Write & build
                </button>
                <button
                  disabled={!lesson}
                  aria-current={view === "preview" ? "page" : undefined}
                  onClick={() => navigate(() => setView("preview"))}
                >
                  Saved learner preview
                </button>
                <button
                  disabled={!lesson}
                  aria-current={view === "publish" ? "page" : undefined}
                  onClick={() => navigate(() => setView("publish"))}
                >
                  Publication
                </button>
              </nav>
            )}
            {lesson && (
              <button
                className="button button-outline"
                disabled={publications.get(lesson.id).archived}
                onClick={duplicateLesson}
              >
                <Copy size={16} aria-hidden="true" />
                Duplicate lesson
              </button>
            )}
          </div>
          {courseView && (view === "new-course" || courseTab === "brief") ? (
            <CourseBrief
              key={`${revision}-${view === "new-course" ? "new-course" : (course?.id ?? "first-course")}`}
              course={view === "new-course" ? undefined : course}
              onDirtyChange={setDirty}
              onSave={(details) => {
                if (view === "new-course" || !course) {
                  const id = model.createCourse(details);
                  if (id) setCourseId(id);
                } else model.saveCourse(details, course.id);
                setView("course");
                setCourseTab("brief");
                setDirty(false);
              }}
            />
          ) : courseView && course ? (
            <CourseReview
              course={course}
              drafts={drafts}
              getPublication={publications.get}
              onOpenLesson={openLesson}
              onPreviewLesson={(id) => openLesson(id, "preview")}
            />
          ) : courseView ? (
            <div className="studio-welcome">
              <BookOpen size={42} aria-hidden="true" />
              <h2>Give your teaching room to grow.</h2>
              <p>
                Create a course brief, then add modules and lessons to the
                outline. Or explore a complete sample first.
              </p>
              <div className="studio-toolbar">
                <button className="button button-primary" onClick={newCourse}>
                  <Plus size={17} aria-hidden="true" />
                  Create a course
                </button>
                <button className="button button-outline" onClick={tryExample}>
                  Explore example course
                </button>
              </div>
            </div>
          ) : null}
          {view === "edit" && (
            <LessonEditor
              key={`${revision}-${lessonId ?? `new-${moduleId ?? "library"}`}`}
              draft={lesson ?? null}
              destination={module?.title}
              onDirtyChange={setDirty}
              onSave={saveLesson}
              onClose={() => {
                setDirty(false);
                setView("course");
                setCourseTab("review");
                setLessonId(null);
              }}
              restoreFocus={() => {}}
            />
          )}
          {view === "preview" && lesson && (
            <section className="studio-reading-preview">
              <div className="studio-canvas-heading">
                <h2>Learner preview</h2>
                <span className="badge">
                  {lesson.example ? "Example · " : ""}
                  {publicationLabel(publications.get(lesson.id))}
                </span>
              </div>
              <LessonContentPreview key={lesson.id} content={lesson} />
            </section>
          )}
          {view === "publish" && lesson && (
            <PublicationDialog
              key={lesson.id}
              draft={lesson}
              record={publications.get(lesson.id)}
              onPublish={() => publications.publish(lesson)}
              onWithdraw={() => publications.withdraw(lesson.id)}
              onArchive={() => publications.archive(lesson.id)}
              onRestore={() => publications.restore(lesson.id)}
              onEdit={() => setView("edit")}
              onClose={() => {
                setView("course");
                setCourseTab("review");
                setLessonId(null);
              }}
              restoreFocus={() => {}}
            />
          )}
          <p className="studio-session-status" role="status">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
