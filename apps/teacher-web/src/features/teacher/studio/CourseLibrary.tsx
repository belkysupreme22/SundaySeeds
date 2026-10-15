import { ArrowRight, Layers, Plus } from "lucide-react";
import type { CourseOutline } from "../courses/useCourseOutlines";

export function CourseLibrary({
  courses,
  onOpen,
  onCreate,
  onExample,
}: {
  courses: CourseOutline[];
  onOpen: (id: string) => void;
  onCreate: () => void;
  onExample: () => void;
}) {
  return (
    <section className="studio-course-library">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Your editorial projects</p>
          <h2>Courses in the making</h2>
        </div>
        <button className="button button-primary" onClick={onCreate}>
          <Plus size={17} aria-hidden="true" />
          New course
        </button>
      </div>
      {courses.length ? (
        <div className="studio-project-grid">
          {courses.map((course) => (
            <article className="panel studio-project-card" key={course.id}>
              <span className="teacher-icon-tile tone-lavender">
                <Layers size={24} aria-hidden="true" />
              </span>
              <span className="badge">
                {course.example ? "Example course" : "Course draft"}
              </span>
              <h3>{course.title}</h3>
              <p className="muted">
                {course.summary ||
                  "Start with a course brief to set the direction."}
              </p>
              <p className="muted">
                {course.modules.length} modules ·{" "}
                {course.modules.reduce(
                  (sum, module) => sum + module.lessonIds.length,
                  0,
                )}{" "}
                lessons
              </p>
              <button
                className="button button-outline"
                onClick={() => onOpen(course.id)}
              >
                Open in studio
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel studio-welcome">
          <Layers size={36} aria-hidden="true" />
          <h3>Turn a collection of lessons into a meaningful course.</h3>
          <p>Plan the outcomes, organize modules and write in one place.</p>
          <button className="button button-outline" onClick={onExample}>
            Explore example course
          </button>
        </div>
      )}
    </section>
  );
}
