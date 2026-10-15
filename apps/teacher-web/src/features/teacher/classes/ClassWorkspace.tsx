import * as Tabs from "@radix-ui/react-tabs";
import { ArrowLeft, BookOpen, Mail, Pencil, Plus, Users } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { CourseOutline } from "../courses/useCourseOutlines";
import type { TeachingClass } from "./types";
import type { TeachingClassesModel } from "./useTeachingClasses";
import { ClassPeople } from "./ClassPeople";

export function ClassWorkspace({
  item,
  courses,
  model,
  onBack,
  onEdit,
  onOpenCourse,
}: {
  item: TeachingClass;
  courses: CourseOutline[];
  model: TeachingClassesModel;
  onBack: () => void;
  onEdit: () => void;
  onOpenCourse: (id: string) => void;
}) {
  const prefix = useId();
  const [courseId, setCourseId] = useState("");
  const [removal, setRemoval] = useState<string | null>(null);
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [status, setStatus] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  const available = courses.filter(
    (course) => !item.courseIds.includes(course.id),
  );
  const selectedCourseAvailable = available.some(
    (course) => course.id === courseId,
  );
  const active = item.members.filter(
    (member) => member.status === "active",
  ).length;
  const pending = item.invitations.filter(
    (invitation) => invitation.status === "pending",
  ).length;
  return (
    <div className="page-stack class-workspace">
      <button
        type="button"
        className="button button-outline class-back"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        All classes
      </button>
      <header className="class-detail-hero class-surface tone-lavender">
        <div>
          <p className="eyebrow">Class workspace · simulation</p>
          <h2 tabIndex={-1} ref={heading}>
            {item.name}
          </h2>
          <div className="class-actions">
            {item.example && (
              <span className="badge tone-yellow">Example class</span>
            )}
            <span className="badge">{item.archived ? "Archived" : "Open"}</span>
            <span className="badge">Adult learners</span>
          </div>
          <p>
            {item.description ||
              "Add a purpose to shape the learning journey for this group."}
          </p>
          {item.meeting && <p className="class-meeting">{item.meeting}</p>}
        </div>
        <button
          type="button"
          className="button button-outline"
          onClick={onEdit}
        >
          <Pencil size={15} />
          Edit brief
        </button>
      </header>
      <div className="class-summary" aria-label="Simulated class contents">
        <div className="tone-mint">
          <Users size={19} />
          <strong>{active}</strong>
          <span>Simulated active members</span>
        </div>
        <div className="tone-yellow">
          <BookOpen size={19} />
          <strong>{item.courseIds.length}</strong>
          <span>Course links</span>
        </div>
        <div className="tone-peach">
          <Mail size={19} />
          <strong>{pending}</strong>
          <span>Simulated pending invitations</span>
        </div>
      </div>
      {item.archived && (
        <div className="class-notice">
          <strong>This class is archived in the simulation.</strong>
          <p>
            Content and people remain visible. Restore the class to change
            course links or membership states.
          </p>
        </div>
      )}
      <Tabs.Root defaultValue="content" className="section-tabs">
        <Tabs.List className="tab-list" aria-label="Class workspace sections">
          <Tabs.Trigger className="tab-trigger" value="content">
            <BookOpen size={16} />
            Learning content
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="roster">
            <Users size={16} />
            Roster
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="invitations">
            <Mail size={16} />
            Invitations
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content className="class-tab-content" value="content">
          <section className="class-surface">
            <div className="class-section-heading">
              <div>
                <p className="eyebrow">Plan the learning journey</p>
                <h3>Courses for this group</h3>
                <p className="muted">
                  Link your actual course outlines. A link here does not publish
                  content, pick a released version or grant learner access.
                </p>
              </div>
            </div>
            {available.length > 0 ? (
              <form
                className="class-course-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (
                    courseId &&
                    available.some((course) => course.id === courseId)
                  ) {
                    model.assign(item.id, courseId);
                    setCourseId("");
                    setStatus("Course linked in the class simulation.");
                  }
                }}
              >
                <label className="field" htmlFor={`${prefix}-course`}>
                  Choose a course
                  <select
                    id={`${prefix}-course`}
                    className="input"
                    value={selectedCourseAvailable ? courseId : ""}
                    onChange={(event) => setCourseId(event.target.value)}
                    disabled={item.archived}
                    required
                  >
                    <option value="">Select a course outline</option>
                    {available.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                        {course.example ? " · Example" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={item.archived || !selectedCourseAvailable}
                >
                  <Plus size={16} />
                  Link course
                </button>
              </form>
            ) : (
              <p className="class-notice muted">
                {courses.length
                  ? "Every available course outline is linked to this class."
                  : "Create or explore a course in the editorial studio first, then return here to link it."}
              </p>
            )}
            {removal && (
              <div
                className="class-confirm"
                role="group"
                aria-label="Confirm course unlink"
              >
                <p>
                  Remove this course link from the class simulation? The course
                  and its lesson drafts remain in the studio.
                </p>
                <div className="class-actions">
                  <button
                    className="button button-outline"
                    type="button"
                    onClick={() => setRemoval(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="button button-outline"
                    type="button"
                    disabled={item.archived}
                    onClick={() => {
                      model.unassign(item.id, removal);
                      setRemoval(null);
                      setStatus(
                        "Course link removed. The course was preserved.",
                      );
                    }}
                  >
                    Remove link
                  </button>
                </div>
              </div>
            )}
            {item.courseIds.length ? (
              <ul className="class-course-list">
                {item.courseIds.map((id) => {
                  const course = courses.find((value) => value.id === id);
                  return (
                    <li key={id}>
                      <span className="teacher-icon-tile tone-yellow">
                        <BookOpen size={22} />
                      </span>
                      <div>
                        <h3>{course?.title ?? "Course outline unavailable"}</h3>
                        {course ? (
                          <>
                            <p className="muted">
                              {course.modules.length} modules ·{" "}
                              {course.modules.reduce(
                                (sum, module) => sum + module.lessonIds.length,
                                0,
                              )}{" "}
                              lesson links
                            </p>
                            {course.example && (
                              <span className="badge tone-yellow">
                                Example course
                              </span>
                            )}
                          </>
                        ) : (
                          <p className="muted">
                            The outline was removed from the studio. Remove this
                            class link when ready.
                          </p>
                        )}
                      </div>
                      <div className="class-actions">
                        {course && (
                          <button
                            type="button"
                            className="button button-outline"
                            onClick={() => onOpenCourse(id)}
                          >
                            Open in studio
                          </button>
                        )}
                        <button
                          type="button"
                          className="button button-outline"
                          disabled={item.archived}
                          onClick={() => setRemoval(id)}
                        >
                          Remove link
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty-state">
                <BookOpen size={27} />
                <h3>No courses linked yet</h3>
                <p className="muted">
                  Build a clear journey by linking a course with ordered modules
                  and lessons.
                </p>
              </div>
            )}
            <p className="class-live-status" role="status">
              {status}
            </p>
          </section>
        </Tabs.Content>
        <Tabs.Content className="class-tab-content" value="roster">
          <ClassPeople
            key={`${item.id}-roster`}
            item={item}
            model={model}
            mode="roster"
          />
        </Tabs.Content>
        <Tabs.Content className="class-tab-content" value="invitations">
          <ClassPeople
            key={`${item.id}-invitations`}
            item={item}
            model={model}
            mode="invitations"
          />
        </Tabs.Content>
      </Tabs.Root>
      <section className="class-lifecycle class-surface">
        <div>
          <h3>{item.archived ? "Bring the class back" : "Class lifecycle"}</h3>
          <p className="muted">
            {item.archived
              ? "Restoring reopens editing in this simulation. It does not restore real access."
              : "Archiving preserves this simulated class, its roster and course links, and pauses changes."}
          </p>
        </div>
        <button
          type="button"
          className="button button-outline"
          onClick={() => setArchiveConfirm(true)}
        >
          {item.archived ? "Restore class" : "Archive class"}
        </button>
        {archiveConfirm && (
          <div
            className="class-confirm"
            role="group"
            aria-label="Confirm class lifecycle change"
          >
            <p>
              {item.archived
                ? "Restore this simulated class for editing?"
                : "Archive this simulated class and pause its editing? No real membership or access changes."}
            </p>
            <div className="class-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => setArchiveConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  model.archive(item.id, !item.archived);
                  setArchiveConfirm(false);
                  heading.current?.focus();
                }}
              >
                {item.archived ? "Confirm restore" : "Confirm archive"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
