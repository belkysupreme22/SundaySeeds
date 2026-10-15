import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  findRecord,
  stateLabels,
  summarize,
  type ReportLearner,
  type ReportLesson,
} from "./reportExamples";

interface Props {
  learners: ReportLearner[];
  lessons: ReportLesson[];
}
export function ReportTables({ learners, lessons }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = learners.find((learner) => learner.id === selectedId);
  return (
    <div className="report-table-stack">
      <section
        className="report-surface"
        aria-labelledby="report-lesson-heading"
      >
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Lesson view</p>
            <h3 id="report-lesson-heading">Where the learning stands</h3>
          </div>
        </div>
        <div
          className="table-wrap"
          tabIndex={0}
          role="region"
          aria-label="Example lesson progress table, scroll horizontally if needed"
        >
          <table className="data-table">
            <caption>
              Example counts for the selected class and lessons. Every learner
              has one expected state per lesson.
            </caption>
            <thead>
              <tr>
                <th scope="col">Lesson</th>
                <th scope="col">Finished check</th>
                <th scope="col">Reading</th>
                <th scope="col">Not started</th>
                <th scope="col">Unavailable</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => {
                const data = summarize(learners, [lesson]);
                return (
                  <tr key={lesson.id}>
                    <th scope="row">{lesson.title}</th>
                    <td>{data.completed}</td>
                    <td>{data.reading}</td>
                    <td>{data.notStarted}</td>
                    <td>{data.missing}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section
        className="report-surface"
        aria-labelledby="report-learner-heading"
      >
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Learner view</p>
            <h3 id="report-learner-heading">A little more context</h3>
          </div>
        </div>
        <div
          className="table-wrap"
          tabIndex={0}
          role="region"
          aria-label="Example learner progress table, scroll horizontally if needed"
        >
          <table className="data-table">
            <caption>
              Fictional adult learners. Counts respect the current lesson
              filter; missing states are shown separately.
            </caption>
            <thead>
              <tr>
                <th scope="col">Learner</th>
                <th scope="col">Finished / selected lessons</th>
                <th scope="col">Unavailable</th>
                <th scope="col">Detail</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((learner) => {
                const data = summarize([learner], lessons);
                const expanded = learner.id === selected?.id;
                return (
                  <tr key={learner.id}>
                    <th scope="row">{learner.name}</th>
                    <td>
                      {data.known ? data.completed : "—"} / {lessons.length}
                    </td>
                    <td>{data.missing}</td>
                    <td>
                      <button
                        type="button"
                        className="button button-outline"
                        aria-expanded={expanded}
                        aria-controls="report-learner-detail"
                        aria-label={`${expanded ? "Hide" : "View"} progress for ${learner.name}`}
                        onClick={() =>
                          setSelectedId(expanded ? null : learner.id)
                        }
                      >
                        {expanded ? "Hide" : "View"}
                        {expanded ? (
                          <ChevronUp size={15} aria-hidden="true" />
                        ) : (
                          <ChevronDown size={15} aria-hidden="true" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          id="report-learner-detail"
          hidden={!selected}
          className="report-learner-detail"
        >
          {selected && (
            <>
              <h3>{selected.name} · selected lessons</h3>
              <ul>
                {lessons.map((lesson) => {
                  const record = findRecord(selected.id, lesson.id);
                  return (
                    <li key={lesson.id}>
                      <div>
                        <strong>{lesson.title}</strong>
                        <span>
                          {record
                            ? stateLabels[record.state]
                            : "State unavailable"}
                        </span>
                      </div>
                      <p>
                        {!record
                          ? "Score unavailable"
                          : record.state === "completed"
                            ? `Best score: ${record.bestScore === null ? "unavailable" : `${record.bestScore}%`}`
                            : "No finished-check score"}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <p className="muted">
                Finishing a knowledge check completes the lesson, including a 0%
                score. Reading alone does not. Best score is separate from
                completion.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
