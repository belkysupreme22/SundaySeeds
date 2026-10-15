import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useId, useRef, useState } from "react";
import { getQuizIssues, type QuizQuestion } from "./types";
import "./quiz-preview.css";

export function QuizPreview({ questions }: { questions: QuizQuestion[] }) {
  const issues = getQuizIssues(questions);
  if (!questions.length)
    return (
      <div className="quiz-preview-empty">
        <h3>No knowledge check added</h3>
        <p>This lesson currently has reading and reflection only.</p>
      </div>
    );
  if (issues.length)
    return (
      <div className="quiz-preview-incomplete">
        <h3>Finish these questions to try the knowledge check</h3>
        <ul>
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
        <p>Return to editing to complete the answers and explanations.</p>
      </div>
    );
  return <QuizAttempt key={JSON.stringify(questions)} questions={questions} />;
}

interface PreviewAnswer {
  optionId: string;
  checked: boolean;
}

function QuizAttempt({ questions }: { questions: QuizQuestion[] }) {
  const groupId = useId();
  const [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<Record<string, PreviewAnswer>>({});
  const [view, setView] = useState<"questions" | "results" | "review">(
    "questions",
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const question = questions[position];
  const answer = answers[question.id];
  const checkedCount = questions.filter(
    (item) => answers[item.id]?.checked,
  ).length;
  const correctCount = questions.filter(
    (item) =>
      answers[item.id]?.checked &&
      answers[item.id]?.optionId === item.correctOptionId,
  ).length;
  const allChecked = checkedCount === questions.length;
  const correct = question.options.find(
    (option) => option.id === question.correctOptionId,
  );
  const isCorrect = answer?.optionId === question.correctOptionId;
  function focusHeading() {
    requestAnimationFrame(() => headingRef.current?.focus());
  }
  function changeView(next: typeof view) {
    setView(next);
    focusHeading();
  }
  function retry() {
    setAnswers({});
    setPosition(0);
    setView("questions");
    focusHeading();
  }
  function move(next: number) {
    if (next < 0 || next >= questions.length) return;
    setPosition(next);
    focusHeading();
  }

  return (
    <section className="quiz-preview" aria-label="Knowledge check preview">
      <div className="quiz-preview-heading">
        <p className="eyebrow">Quick knowledge check</p>
        <span className="badge">Preview attempt</span>
      </div>
      {view === "results" && (
        <div className="quiz-preview-results">
          <CheckCircle2 size={38} aria-hidden="true" />
          <h3 ref={headingRef} tabIndex={-1}>
            You’ve checked every answer
          </h3>
          <p className="quiz-preview-score">
            {correctCount} of {questions.length} correct
          </p>
          <p>
            Review the explanations or try a fresh attempt. These results belong
            to this preview only.
          </p>
          <div className="quiz-preview-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() => changeView("review")}
            >
              Review answers
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={retry}
            >
              <RotateCcw size={17} aria-hidden="true" />
              Try again
            </button>
          </div>
        </div>
      )}
      {view === "review" && (
        <div className="quiz-preview-review">
          <h3 ref={headingRef} tabIndex={-1}>
            Your answer review
          </h3>
          <ol>
            {questions.map((item, index) => {
              const submitted = answers[item.id];
              const chosen = item.options.find(
                (option) => option.id === submitted?.optionId,
              );
              const correctOption = item.options.find(
                (option) => option.id === item.correctOptionId,
              );
              const matches = submitted?.optionId === item.correctOptionId;
              return (
                <li key={item.id}>
                  <p className="eyebrow">
                    Question {index + 1} ·{" "}
                    {matches ? "Correct" : "Keep learning"}
                  </p>
                  <h4>{item.prompt}</h4>
                  <p>
                    <strong>Your answer:</strong> {chosen?.text}
                  </p>
                  <p>
                    <strong>Correct answer:</strong> {correctOption?.text}
                  </p>
                  <p className="quiz-preview-review-explanation">
                    {item.explanation}
                  </p>
                </li>
              );
            })}
          </ol>
          <div className="quiz-preview-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() => changeView("results")}
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Back to results
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={retry}
            >
              <RotateCcw size={17} aria-hidden="true" />
              Try again
            </button>
          </div>
        </div>
      )}
      {view === "questions" && (
        <>
          <div className="quiz-preview-progress-copy">
            <span>
              Question {position + 1} of {questions.length}
            </span>
            <span>{checkedCount} checked</span>
          </div>
          <progress
            className="quiz-preview-progress"
            value={checkedCount}
            max={questions.length}
            aria-label="Answers checked"
          />
          <h3 ref={headingRef} tabIndex={-1} className="quiz-preview-prompt">
            {question.prompt}
          </h3>
          <fieldset className="quiz-preview-options" disabled={answer?.checked}>
            <legend>Choose one answer</legend>
            {question.options.map((option, index) => {
              const selected = answer?.optionId === option.id;
              const correctOption = Boolean(
                answer?.checked && option.id === question.correctOptionId,
              );
              const wrongSelection = Boolean(
                answer?.checked && selected && !isCorrect,
              );
              return (
                <label
                  key={option.id}
                  className={`quiz-preview-option${selected ? " is-selected" : ""}${correctOption ? " is-correct" : ""}${wrongSelection ? " is-wrong" : ""}`}
                >
                  <input
                    type="radio"
                    name={`${groupId}-${question.id}`}
                    checked={selected}
                    onChange={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: { optionId: option.id, checked: false },
                      }))
                    }
                  />
                  <span className="quiz-preview-letter" aria-hidden="true">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="quiz-preview-option-copy">
                    {option.text}
                    {correctOption && <small>Correct answer</small>}
                    {wrongSelection && <small>Your answer</small>}
                  </span>
                  {correctOption ? (
                    <CheckCircle2 size={20} aria-hidden="true" />
                  ) : wrongSelection ? (
                    <XCircle size={20} aria-hidden="true" />
                  ) : null}
                </label>
              );
            })}
          </fieldset>
          {answer?.checked ? (
            <div
              ref={feedbackRef}
              tabIndex={-1}
              className={`quiz-preview-feedback${isCorrect ? " is-correct" : " is-wrong"}`}
              role="status"
            >
              <strong>{isCorrect ? "Correct!" : "Keep learning"}</strong>
              <p>
                <strong>Correct answer:</strong> {correct?.text}
              </p>
              <p>{question.explanation}</p>
            </div>
          ) : (
            <button
              type="button"
              className="button button-primary"
              disabled={!answer?.optionId}
              onClick={() => {
                if (answer?.optionId)
                  setAnswers((current) => ({
                    ...current,
                    [question.id]: { ...answer, checked: true },
                  }));
                requestAnimationFrame(() => feedbackRef.current?.focus());
              }}
            >
              Check answer
            </button>
          )}
          <div className="quiz-preview-actions">
            <button
              type="button"
              className="button button-outline"
              disabled={position === 0}
              onClick={() => move(position - 1)}
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Previous
            </button>
            {position === questions.length - 1 ? (
              <button
                type="button"
                className="button button-primary"
                disabled={!allChecked}
                onClick={() => changeView("results")}
              >
                See results
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                className="button button-primary"
                disabled={!answer?.checked}
                onClick={() => move(position + 1)}
              >
                Next question
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
