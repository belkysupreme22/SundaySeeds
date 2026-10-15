import { useEffect, useState, type FormEvent } from "react";
import { InputField, TextAreaField } from "../../../shared/ui/InputField";
import type {
  CourseDetails,
  CourseOutline,
} from "../courses/useCourseOutlines";

export function CourseBrief({
  course,
  onSave,
  onDirtyChange,
}: {
  course?: CourseOutline;
  onSave: (details: CourseDetails) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [title, setTitle] = useState(course?.title ?? "");
  const [summary, setSummary] = useState(course?.summary ?? "");
  const [audience, setAudience] = useState(
    course?.audience ?? "Adult learners",
  );
  const [outcomes, setOutcomes] = useState((course?.outcomes ?? []).join("\n"));
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify({ title, summary, audience, outcomes }),
  );
  const [status, setStatus] = useState("");
  const dirty =
    JSON.stringify({ title, summary, audience, outcomes }) !== baseline;
  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setStatus("Give this course a title.");
      return;
    }
    const goals = outcomes
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    if (goals.length > 6 || goals.some((item) => item.length > 200)) {
      setStatus("Use up to six outcomes, 200 characters each.");
      return;
    }
    onSave({
      title: title.trim(),
      summary: summary.trim(),
      audience: audience.trim(),
      outcomes: goals,
    });
    setBaseline(JSON.stringify({ title, summary, audience, outcomes }));
    setStatus("Course brief saved for this session.");
  }
  return (
    <form className="studio-brief" onSubmit={save}>
      <div className="studio-canvas-heading">
        <div>
          <p className="eyebrow">Course brief</p>
          <h2>
            {course
              ? "Shape the promise of your course"
              : "Start with a clear purpose"}
          </h2>
          <p className="muted">
            Define who it is for and what learners should take away.
          </p>
        </div>
        <span className="badge">
          {dirty ? "Unsaved changes" : "Course planning"}
        </span>
      </div>
      <label className="field">
        Course title
        <InputField
          autoFocus
          required
          maxLength={100}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="For example, Faith in Everyday Life"
        />
      </label>
      <label className="field">
        Course introduction
        <TextAreaField
          rows={4}
          maxLength={1000}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Introduce the journey and the questions it explores."
        />
      </label>
      <label className="field">
        Who is this course for?
        <InputField
          maxLength={200}
          value={audience}
          onChange={(event) => setAudience(event.target.value)}
          placeholder="Adult learners exploring practical faith"
        />
      </label>
      <label className="field">
        Course learning outcomes
        <TextAreaField
          rows={4}
          maxLength={1206}
          value={outcomes}
          onChange={(event) => setOutcomes(event.target.value)}
          placeholder={
            "Connect scripture with everyday choices\nPractise compassionate care for others"
          }
        />
        <span className="muted">
          One outcome per line · Up to six, 200 characters each.
        </span>
      </label>
      <div className="studio-toolbar">
        <p role="status">{status}</p>
        <button className="button button-primary" type="submit">
          {course ? "Save course brief" : "Create course"}
        </button>
      </div>
    </form>
  );
}
