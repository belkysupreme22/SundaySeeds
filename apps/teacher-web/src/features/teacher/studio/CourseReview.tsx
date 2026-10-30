import { BookOpen, CheckCircle2, CircleAlert, FilePenLine, Save, Send } from "lucide-react";
import type { CourseOutline } from "../courses/useCourseOutlines";
import type { LessonDraft } from "../lessons/types";
import {
  getPublicationChecks,
  type LessonPublication,
} from "../publication/publicationModel";

export function CourseReview({
  course,
  drafts,
  getPublication,
  onOpenLesson,
  onPreviewLesson,
  onSaveDurableDraft,
  savingDraft,
  onSubmitForReview,
  submittingForReview,
  durableRevision,
  durableError,
  lastSavedAt,
}: {
  course: CourseOutline;
  drafts: LessonDraft[];
  getPublication: (id: string) => LessonPublication;
  onOpenLesson: (id: string) => void;
  onPreviewLesson: (id: string) => void;
  onSaveDurableDraft?: () => void;
  savingDraft?: boolean;
  onSubmitForReview?: () => void;
  submittingForReview?: boolean;
  durableRevision?: number;
  durableError?: string | null;
  lastSavedAt?: string | null;
}) {
  const ids = course.modules.flatMap((module) => module.lessonIds);
  const linked = ids
    .map((id) => drafts.find((draft) => draft.id === id))
    .filter((item): item is LessonDraft => Boolean(item));
  const words = linked.reduce(
    (sum, lesson) =>
      sum +
      lesson.sections.reduce(
        (count, section) =>
          count + section.body.trim().split(/\s+/).filter(Boolean).length,
        0,
      ),
    0,
  );
  const questions = linked.reduce(
    (sum, lesson) => sum + (lesson.quiz?.length ?? 0),
    0,
  );
  const emptyModules = course.modules.filter(
    (module) => !module.lessonIds.length,
  );
  return (
    <section className="studio-review">
      <header className="studio-canvas-heading">
        <div>
          <p className="eyebrow">Course review · Draft content</p>
          <h2>{course.title}</h2>
          <p>{course.summary || "Add an introduction in the course brief."}</p>
          {course.audience && <p className="muted">For {course.audience}</p>}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {course.isAssigned && (
            <span className="badge tone-mint">
              Assigned draft · Rev {durableRevision ?? course.draftRevision ?? 0}
            </span>
          )}
          {course.example && <span className="badge">Example course</span>}
          {onSaveDurableDraft && (
            <button
              type="button"
              className="button button-primary"
              onClick={onSaveDurableDraft}
              disabled={savingDraft || submittingForReview}
            >
              <Save size={16} />
              <span>{savingDraft ? "Saving to database…" : "Save draft to database"}</span>
            </button>
          )}
          {onSubmitForReview && (
            <button
              type="button"
              className="button button-outline"
              onClick={onSubmitForReview}
              disabled={savingDraft || submittingForReview || (durableRevision ?? 0) === 0}
              title={
                (durableRevision ?? 0) === 0
                  ? "Save draft first before submitting for review"
                  : "Submit frozen draft snapshot for admin review"
              }
            >
              <Send size={16} />
              <span>{submittingForReview ? "Submitting…" : "Submit for Admin Review"}</span>
            </button>
          )}
        </div>
      </header>
      {durableError && (
        <div
          role="alert"
          style={{
            background: "#fff0f0",
            border: "1px solid #d94343",
            color: "#a81c1c",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {durableError}
        </div>
      )}
      {lastSavedAt && (
        <p className="muted" style={{ fontSize: "12px", marginTop: -8, marginBottom: 16 }}>
          Last saved to Supabase: {new Date(lastSavedAt).toLocaleTimeString()}
        </p>
      )}
      <div className="studio-metrics">
        <div>
          <strong>{course.modules.length}</strong>
          <span>Modules</span>
        </div>
        <div>
          <strong>{linked.length}</strong>
          <span>Lessons</span>
        </div>
        <div>
          <strong>{questions}</strong>
          <span>Questions</span>
        </div>
        <div>
          <strong>{words}</strong>
          <span>Reading words</span>
        </div>
      </div>
      {Boolean(course.outcomes?.length) && (
        <section className="studio-course-outcomes">
          <h3>The course promises to help learners…</h3>
          <ul>
            {course.outcomes?.map((outcome, index) => (
              <li key={index}>{outcome}</li>
            ))}
          </ul>
        </section>
      )}
      {(!course.modules.length || emptyModules.length > 0) && (
        <div className="studio-note">
          <CircleAlert size={20} aria-hidden="true" />
          <p>
            {!course.modules.length
              ? "Add your first module in the outline to build this course."
              : `${emptyModules.length} modules still need a lesson. Add or attach lessons from the outline.`}
          </p>
        </div>
      )}
      <div className="studio-review-modules">
        {course.modules.map((module, index) => (
          <section key={module.id}>
            <div className="studio-review-module-heading">
              <span className="eyebrow">Module {index + 1}</span>
              <h3>{module.title}</h3>
            </div>
            {module.lessonIds.length ? (
              <ol>
                {module.lessonIds.map((id) => {
                  const lesson = drafts.find((item) => item.id === id);
                  if (!lesson)
                    return (
                      <li key={id}>
                        A linked lesson is missing. Remove its link in the
                        outline.
                      </li>
                    );
                  const issues = getPublicationChecks(lesson).flatMap(
                    (check) => check.issues,
                  );
                  const archived = getPublication(id).archived;
                  return (
                    <li key={id}>
                      <BookOpen size={20} aria-hidden="true" />
                      <div>
                        <h4>{lesson.title}</h4>
                        <p className="muted">
                          {lesson.sections.length} reading sections ·{" "}
                          {lesson.quiz?.length ?? 0} questions
                        </p>
                        <span className="studio-readiness">
                          {archived ? (
                            <>
                              <CircleAlert size={15} aria-hidden="true" />
                              Archived · restore before editing
                            </>
                          ) : issues.length ? (
                            <>
                              <CircleAlert size={15} aria-hidden="true" />
                              {issues.length} content issues
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={15} aria-hidden="true" />
                              Content checks complete
                            </>
                          )}
                        </span>
                      </div>
                      <div className="studio-outline-actions">
                        <button
                          className="button button-outline"
                          onClick={() => onPreviewLesson(id)}
                        >
                          Read lesson
                        </button>
                        <button
                          className="icon-button"
                          disabled={archived}
                          aria-label={`Edit ${lesson.title}`}
                          onClick={() => onOpenLesson(id)}
                        >
                          <FilePenLine size={17} aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="muted">No lessons yet.</p>
            )}
          </section>
        ))}
      </div>
      <p className="studio-note">
        This reviews the complete draft course. Lesson publication is simulated
        separately; course-wide release and learner access await backend
        decisions.
      </p>
    </section>
  );
}
