import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import { InputField, TextAreaField } from "../../../shared/ui/InputField";
import { getQuizIssues, MAX_QUIZ_QUESTIONS, type QuizQuestion } from "./types";
import { QuizPreview } from "./QuizPreview";
import "./quiz-builder.css";

export function QuizBuilder({
  questions,
  onChange,
}: {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}) {
  const groupId = useId();
  const counter = useRef(1);
  const addRef = useRef<HTMLButtonElement>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const issues = getQuizIssues(questions);
  function nextId() {
    const ids = new Set(
      questions.flatMap((question) => [
        question.id,
        ...question.options.map((option) => option.id),
      ]),
    );
    let id = `quiz-item-${counter.current++}`;
    while (ids.has(id)) id = `quiz-item-${counter.current++}`;
    return id;
  }
  function update(id: string, change: Partial<QuizQuestion>) {
    onChange(
      questions.map((question) =>
        question.id === id ? { ...question, ...change } : question,
      ),
    );
  }
  function addQuestion() {
    if (questions.length >= MAX_QUIZ_QUESTIONS) return;
    onChange([
      ...questions,
      {
        id: nextId(),
        prompt: "",
        options: [
          { id: nextId(), text: "" },
          { id: nextId(), text: "" },
        ],
        correctOptionId: null,
        explanation: "",
      },
    ]);
    setStatus(
      `Question ${questions.length + 1} added. Write the question, answers and explanation.`,
    );
  }
  function moveQuestion(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    const ordered = [...questions];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    onChange(ordered);
    setStatus(`Question moved to position ${target + 1}.`);
  }
  function moveOption(
    question: QuizQuestion,
    index: number,
    direction: -1 | 1,
  ) {
    const target = index + direction;
    if (target < 0 || target >= question.options.length) return;
    const options = [...question.options];
    [options[index], options[target]] = [options[target], options[index]];
    update(question.id, { options });
    setStatus(`Answer moved to position ${target + 1}.`);
  }
  return (
    <section
      className="lesson-editor-group quiz-builder"
      aria-labelledby={`${groupId}-heading`}
    >
      <div className="lesson-editor-heading">
        <div>
          <p className="eyebrow">Knowledge check · Optional</p>
          <h3 id={`${groupId}-heading`}>
            Help learners put the lesson into practice
          </h3>
          <p className="muted">
            Add short questions with one correct answer. Learners receive the
            answer and explanation immediately.
          </p>
        </div>
        <span className="badge">
          {questions.length} / {MAX_QUIZ_QUESTIONS} questions
        </span>
      </div>
      {questions.length === 0 && (
        <div className="quiz-builder-empty">
          <strong>A lesson can stand on its own.</strong>
          <p>
            Add a knowledge check when a quick question would help learners
            remember its message.
          </p>
        </div>
      )}
      <ol className="quiz-question-list">
        {questions.map((question, index) => (
          <li className="quiz-question-card" key={question.id}>
            <div className="quiz-question-header">
              <strong>Question {index + 1}</strong>
              <div className="lesson-editor-actions">
                <button
                  type="button"
                  className="icon-button"
                  disabled={index === 0}
                  aria-label={`Move question ${index + 1} up`}
                  onClick={() => moveQuestion(index, -1)}
                >
                  <ArrowUp size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  disabled={index === questions.length - 1}
                  aria-label={`Move question ${index + 1} down`}
                  onClick={() => moveQuestion(index, 1)}
                >
                  <ArrowDown size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Remove question ${index + 1}`}
                  onClick={() => setRemoving(question.id)}
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="quiz-question-fields">
              <label className="field">
                Question
                <TextAreaField
                  required
                  maxLength={400}
                  rows={3}
                  value={question.prompt}
                  onChange={(event) =>
                    update(question.id, { prompt: event.target.value })
                  }
                  placeholder="What could you do to show kindness to a neighbour?"
                />
              </label>
              <fieldset className="quiz-options-fieldset">
                <legend>Answer options</legend>
                <p className="muted">
                  Write two to four answers, then select the correct one.
                </p>
                <ol className="quiz-option-list">
                  {question.options.map((option, optionIndex) => (
                    <li
                      className={`quiz-option-editor${question.correctOptionId === option.id ? " quiz-option-correct" : ""}`}
                      key={option.id}
                    >
                      <label className="quiz-correct-control">
                        <input
                          type="radio"
                          name={`${groupId}-${question.id}-correct`}
                          checked={question.correctOptionId === option.id}
                          onChange={() =>
                            update(question.id, { correctOptionId: option.id })
                          }
                        />
                        <span className="sr-only">
                          Mark answer {optionIndex + 1} correct for question{" "}
                          {index + 1}
                        </span>
                        <span aria-hidden="true">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                      </label>
                      <label className="field quiz-answer-field">
                        <span className="sr-only">
                          Question {index + 1}, answer {optionIndex + 1}
                        </span>
                        <InputField
                          required
                          maxLength={200}
                          value={option.text}
                          onChange={(event) =>
                            update(question.id, {
                              options: question.options.map((answer) =>
                                answer.id === option.id
                                  ? { ...answer, text: event.target.value }
                                  : answer,
                              ),
                            })
                          }
                          placeholder={`Answer ${optionIndex + 1}`}
                        />
                      </label>
                      <div className="lesson-editor-actions quiz-option-actions">
                        <button
                          type="button"
                          className="icon-button"
                          disabled={optionIndex === 0}
                          aria-label={`Move answer ${optionIndex + 1} up in question ${index + 1}`}
                          onClick={() => moveOption(question, optionIndex, -1)}
                        >
                          <ArrowUp size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          disabled={optionIndex === question.options.length - 1}
                          aria-label={`Move answer ${optionIndex + 1} down in question ${index + 1}`}
                          onClick={() => moveOption(question, optionIndex, 1)}
                        >
                          <ArrowDown size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          disabled={question.options.length <= 2}
                          aria-label={`Remove answer ${optionIndex + 1} from question ${index + 1}`}
                          onClick={() => {
                            update(question.id, {
                              options: question.options.filter(
                                (answer) => answer.id !== option.id,
                              ),
                              correctOptionId:
                                question.correctOptionId === option.id
                                  ? null
                                  : question.correctOptionId,
                            });
                            setStatus(
                              question.correctOptionId === option.id
                                ? "Correct answer removed. Choose another correct answer."
                                : "Answer removed.",
                            );
                          }}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  className="button button-outline"
                  disabled={question.options.length >= 4}
                  onClick={() =>
                    update(question.id, {
                      options: [
                        ...question.options,
                        { id: nextId(), text: "" },
                      ],
                    })
                  }
                >
                  <Plus size={17} aria-hidden="true" />
                  Add answer option
                </button>
              </fieldset>
              <label className="field">
                Answer explanation
                <TextAreaField
                  required
                  maxLength={1000}
                  rows={3}
                  value={question.explanation}
                  onChange={(event) =>
                    update(question.id, { explanation: event.target.value })
                  }
                  placeholder="Explain why this answer fits the lesson, including encouragement for another try."
                />
              </label>
              {removing === question.id && (
                <div className="lesson-discard">
                  <p>
                    Remove question {index + 1}, its answers and explanation?
                  </p>
                  <div className="lesson-editor-actions">
                    <button
                      type="button"
                      className="button button-outline"
                      onClick={() => setRemoving(null)}
                    >
                      Keep question
                    </button>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => {
                        onChange(
                          questions.filter((item) => item.id !== question.id),
                        );
                        setRemoving(null);
                        setStatus("Question removed from this lesson.");
                        addRef.current?.focus();
                      }}
                    >
                      Remove question
                    </button>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      <button
        ref={addRef}
        type="button"
        className="button button-outline"
        disabled={questions.length >= MAX_QUIZ_QUESTIONS}
        onClick={addQuestion}
      >
        <Plus size={17} aria-hidden="true" />
        Add question
      </button>
      {issues.length > 0 && (
        <div className="quiz-builder-issues">
          <strong>Before saving this knowledge check</strong>
          <ul>
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      {questions.length > 0 && issues.length === 0 && (
        <p className="quiz-builder-ready">
          Every question has a correct answer and explanation.
        </p>
      )}
      {questions.length > 0 && (
        <>
          <button
            type="button"
            className="button button-outline"
            onClick={() => setPreviewing((current) => !current)}
          >
            {previewing
              ? "Close knowledge check preview"
              : "Preview knowledge check"}
          </button>
          {previewing && <QuizPreview questions={questions} />}
        </>
      )}
      <p className="lesson-editor-status" role="status">
        {status}
      </p>
    </section>
  );
}
