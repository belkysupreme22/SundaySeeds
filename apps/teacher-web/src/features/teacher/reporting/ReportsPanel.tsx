import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCheck,
  Database,
  Users,
} from "lucide-react";
import type { CourseOutline } from "../courses/useCourseOutlines";
import { ReportChartPreview } from "./ReportChartPreview";
import { ReportTables } from "./ReportTables";
import { reportClasses, reportCourses, summarize } from "./reportExamples";
import {
  fetchMyTeachingClasses,
  fetchClassLearningSummary,
  type TeachingClassSummary,
  type ClassLearningSummary,
} from "../data/staffDraftApi";
import "./reporting.css";

export function ReportsPanel({ courses }: { courses: CourseOutline[] }) {
  const [example, setExample] = useState(false);
  const [liveClasses, setLiveClasses] = useState<TeachingClassSummary[]>([]);
  const [selectedLiveClassId, setSelectedLiveClassId] = useState<string | null>(null);
  const [liveSummary, setLiveSummary] = useState<ClassLearningSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [classId, setClassId] = useState(reportClasses[0].id);
  const [courseId, setCourseId] = useState(reportCourses[0].id);
  const [lessonId, setLessonId] = useState("");

  // Load connected classes
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const cls = await fetchMyTeachingClasses();
        if (active && cls && cls.length > 0) {
          setLiveClasses(cls);
          setSelectedLiveClassId(cls[0].id);
        }
      } catch {
        // Fall back gracefully
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  // Load live summary when live class selected
  useEffect(() => {
    if (!selectedLiveClassId) {
      setLiveSummary(null);
      return;
    }
    let active = true;
    setLoadingSummary(true);
    fetchClassLearningSummary(selectedLiveClassId)
      .then((summary) => {
        if (active) setLiveSummary(summary);
      })
      .catch(() => {
        if (active) setLiveSummary(null);
      })
      .finally(() => {
        if (active) setLoadingSummary(false);
      });
    return () => {
      active = false;
    };
  }, [selectedLiveClassId]);

  const selectedClass =
    reportClasses.find((item) => item.id === classId) ?? reportClasses[0];
  const availableCourses = reportCourses.filter((course) =>
    selectedClass.courseIds.includes(course.id),
  );
  const selectedCourse =
    availableCourses.find((course) => course.id === courseId) ??
    availableCourses[0];
  const selectedLessons = selectedCourse.lessons.filter(
    (lesson) => !lessonId || lesson.id === lessonId,
  );
  const summary = summarize(selectedClass.learners, selectedLessons);
  const chart = [
    { label: "Finished", count: summary.completed },
    { label: "Reading", count: summary.reading },
    { label: "Not started", count: summary.notStarted },
    { label: "Unavailable", count: summary.missing },
  ];
  return (
    <section
      className="page-stack reports-panel"
      aria-labelledby="reports-heading"
    >
      <header className="report-heading">
        <div>
          <p className="eyebrow">Teaching insight</p>
          <h2 id="reports-heading">See the learning, support the learner.</h2>
          <p className="muted">
            A clear picture of lesson completion, with the context behind each
            number.
          </p>
        </div>
        <span className="report-heading-icon tone-mint">
          <BarChart3 size={27} aria-hidden="true" />
        </span>
      </header>
      {!example ? (
        <>
          {liveClasses.length > 0 ? (
            <div className="page-stack" style={{ gap: "20px" }}>
              <div
                className="panel"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: "#ffffff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600 }}>Teaching Class:</label>
                  <select
                    className="input"
                    value={selectedLiveClassId || ""}
                    onChange={(e) => setSelectedLiveClassId(e.target.value)}
                    style={{ minWidth: "220px" }}
                  >
                    {liveClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.memberCount} members)
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setExample(true)}
                >
                  Explore example dataset
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>

              {loadingSummary ? (
                <div className="panel" style={{ padding: "32px", textAlign: "center" }}>
                  <p className="muted">Loading class learning progress...</p>
                </div>
              ) : liveSummary ? (
                <>
                  <div className="report-metrics" aria-label="Connected reporting metrics">
                    <article className="report-metric tone-lavender">
                      <Users size={20} aria-hidden="true" />
                      <h3>Class learners</h3>
                      <strong>{liveSummary.member_count}</strong>
                      <p>Active class members</p>
                    </article>
                    <article className="report-metric tone-mint">
                      <CheckCheck size={20} aria-hidden="true" />
                      <h3>Lessons completed</h3>
                      <strong>
                        {liveSummary.courses.reduce((sum, c) => sum + c.completed_lessons, 0)}
                      </strong>
                      <p>Readings completed by class</p>
                    </article>
                    <article className="report-metric tone-yellow">
                      <BookOpen size={20} aria-hidden="true" />
                      <h3>Average quiz score</h3>
                      <strong>
                        {liveSummary.courses.length > 0 &&
                        liveSummary.courses.some((c) => c.quizzes_taken > 0)
                          ? `${Math.round(
                              liveSummary.courses
                                .filter((c) => c.quizzes_taken > 0)
                                .reduce((sum, c) => sum + c.average_quiz_score, 0) /
                                (liveSummary.courses.filter((c) => c.quizzes_taken > 0).length || 1),
                            )}%`
                          : "—"}
                      </strong>
                      <p>Across finished knowledge checks</p>
                    </article>
                    <article className="report-metric tone-peach">
                      <Database size={20} aria-hidden="true" />
                      <h3>Quizzes taken</h3>
                      <strong>
                        {liveSummary.courses.reduce((sum, c) => sum + c.quizzes_taken, 0)}
                      </strong>
                      <p>Total completed assessments</p>
                    </article>
                  </div>

                  {liveSummary.courses.length > 0 ? (
                    <div className="panel" style={{ padding: "20px" }}>
                      <h3 style={{ fontSize: "16px", margin: "0 0 16px 0" }}>Course Breakdown</h3>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--line)", textAlign: "left" }}>
                            <th style={{ padding: "8px 12px" }}>Course Title</th>
                            <th style={{ padding: "8px 12px" }}>Active Learners</th>
                            <th style={{ padding: "8px 12px" }}>Lessons Read</th>
                            <th style={{ padding: "8px 12px" }}>Avg Quiz Score</th>
                            <th style={{ padding: "8px 12px" }}>Quizzes Taken</th>
                          </tr>
                        </thead>
                        <tbody>
                          {liveSummary.courses.map((cs) => (
                            <tr key={cs.course_id} style={{ borderBottom: "1px solid var(--line)" }}>
                              <td style={{ padding: "10px 12px", fontWeight: 600 }}>{cs.title}</td>
                              <td style={{ padding: "10px 12px" }}>{cs.active_learners}</td>
                              <td style={{ padding: "10px 12px" }}>{cs.completed_lessons}</td>
                              <td style={{ padding: "10px 12px" }}>
                                {cs.quizzes_taken > 0 ? `${cs.average_quiz_score}%` : "—"}
                              </td>
                              <td style={{ padding: "10px 12px" }}>{cs.quizzes_taken}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="panel" style={{ padding: "24px", textAlign: "center" }}>
                      <p className="muted">
                        No courses are currently assigned to this class. Assign courses in the Classes workspace to see progress metrics.
                      </p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          ) : (
            <>
              <div
                className="report-metrics"
                aria-label="Connected reporting availability"
              >
                {[
                  { label: "Learner progress", Icon: Users, tone: "lavender" },
                  { label: "Lesson completion", Icon: CheckCheck, tone: "mint" },
                  { label: "Knowledge checks", Icon: BookOpen, tone: "yellow" },
                  { label: "Data coverage", Icon: Database, tone: "peach" },
                ].map(({ label, Icon, tone }) => (
                  <article className={`report-metric tone-${tone}`} key={label}>
                    <Icon size={20} aria-hidden="true" />
                    <h3>{label}</h3>
                    <strong className="report-unavailable-value">
                      Unavailable
                    </strong>
                    <p>No connected learner results</p>
                  </article>
                ))}
              </div>
              <div className="report-surface report-empty">
                <span className="report-heading-icon tone-lavender">
                  <BookOpen size={27} aria-hidden="true" />
                </span>
                <h3>A report needs recorded learning.</h3>
                <p className="muted">
                  Your {courses.length} course{" "}
                  {courses.length === 1 ? "outline is" : "outlines are"} authoring
                  content. Create a class in Classes workspace and invite learners to record real learning results.
                </p>
                <p className="muted">
                  Explore a fictional dataset to review filters, completion measures
                  and missing-data states.
                </p>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setExample(true)}
                >
                  Explore example report
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="report-example-notice">
            <div>
              <span className="badge tone-yellow">Example report</span>
              <p>
                Fictional adult learners and fixed learning records. Separate
                from your authored courses and class simulations.
              </p>
            </div>
            <button
              type="button"
              className="button button-outline"
              onClick={() => setExample(false)}
            >
              Close example
            </button>
          </div>
          <div className="report-surface report-filters">
            <label className="field">
              Class
              <select
                className="input"
                value={classId}
                onChange={(event) => {
                  const nextClass =
                    reportClasses.find(
                      (item) => item.id === event.target.value,
                    ) ?? reportClasses[0];
                  setClassId(nextClass.id);
                  setCourseId(nextClass.courseIds[0]);
                  setLessonId("");
                }}
              >
                {reportClasses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Course
              <select
                className="input"
                value={selectedCourse.id}
                onChange={(event) => {
                  setCourseId(event.target.value);
                  setLessonId("");
                }}
              >
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Lesson
              <select
                className="input"
                value={lessonId}
                onChange={(event) => setLessonId(event.target.value)}
              >
                <option value="">All course lessons</option>
                {selectedCourse.lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </label>
            <p className="muted">
              Try New group for a recorded 0%, or Evening group for unavailable
              results.
            </p>
          </div>
          <p className="sr-only" role="status">
            Example report: {selectedClass.title}, {selectedCourse.title},{" "}
            {lessonId ? selectedLessons[0]?.title : "all lessons"}.{" "}
            {summary.completed} finished checks, {summary.known} recorded lesson
            states, {summary.missing} unavailable.
          </p>
          <div className="report-metrics" aria-label="Example report summary">
            <article className="report-metric tone-lavender">
              <Users size={20} aria-hidden="true" />
              <h3>Selected learners</h3>
              <strong>{selectedClass.learners.length}</strong>
              <p>
                {selectedLessons.length} selected{" "}
                {selectedLessons.length === 1 ? "lesson" : "lessons"} per
                learner
              </p>
            </article>
            <article className="report-metric tone-mint">
              <CheckCheck size={20} aria-hidden="true" />
              <h3>Finished checks</h3>
              <strong>{summary.known ? summary.completed : "—"}</strong>
              <p>
                {summary.known
                  ? `Of ${summary.known} recorded lesson states`
                  : "No recorded lesson states"}
              </p>
            </article>
            <article className="report-metric tone-yellow">
              <BookOpen size={20} aria-hidden="true" />
              <h3>Completion among recorded states</h3>
              <strong>
                {summary.rate === null ? "—" : `${summary.rate}%`}
              </strong>
              <p>
                {summary.rate === null
                  ? "Unavailable, rather than zero"
                  : `${summary.completed} finished ÷ ${summary.known} recorded`}
              </p>
            </article>
            <article className="report-metric tone-peach">
              <Database size={20} aria-hidden="true" />
              <h3>Data coverage</h3>
              <strong>
                {summary.known}/{summary.assigned}
              </strong>
              <p>
                {summary.missing} unavailable lesson{" "}
                {summary.missing === 1 ? "state" : "states"}
              </p>
            </article>
          </div>
          {summary.missing > 0 && (
            <div className="report-data-note">
              <strong>
                {summary.missing} lesson{" "}
                {summary.missing === 1 ? "state is" : "states are"} unavailable.
              </strong>
              <p>
                The completion percentage uses recorded states only. It does not
                describe every assigned lesson; missing data never becomes “not
                started.”
              </p>
            </div>
          )}
          <div className="report-content-grid">
            <ReportChartPreview data={chart} />
            <section
              className="report-surface report-method"
              aria-labelledby="report-measures-heading"
            >
              <p className="eyebrow">Read the numbers</p>
              <h3 id="report-measures-heading">What completion means</h3>
              <dl>
                <div>
                  <dt>One expected state</dt>
                  <dd>
                    One selected learner × one selected lesson. This selection
                    has {summary.assigned} expected states.
                  </dd>
                </div>
                <div>
                  <dt>Finished check</dt>
                  <dd>
                    The learner finished the lesson’s automatic knowledge check,
                    including a 0% score. There is no passing threshold or
                    teacher approval.
                  </dd>
                </div>
                <div>
                  <dt>Recorded completion</dt>
                  <dd>
                    Finished checks ÷ recorded states, rounded to a whole
                    percent. Reading and not started are recorded states;
                    unavailable records are excluded.
                  </dd>
                </div>
                <div>
                  <dt>Course scope</dt>
                  <dd>
                    This screen reports selected lesson states. A lesson filter
                    does not establish overall course completion; connected
                    course and version rules remain to be agreed.
                  </dd>
                </div>
              </dl>
              <p className="muted">
                No time spent, date history, answer-level activity or real
                learner results are inferred.
              </p>
            </section>
          </div>
          <ReportTables
            key={`${classId}-${selectedCourse.id}-${lessonId}`}
            learners={selectedClass.learners}
            lessons={selectedLessons}
          />
        </>
      )}
    </section>
  );
}
