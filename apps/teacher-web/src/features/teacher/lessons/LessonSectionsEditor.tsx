import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { InputField, TextAreaField } from "../../../shared/ui/InputField";
import type { LessonSection } from "./types";

export function LessonSectionsEditor({
  sections,
  onChange,
}: {
  sections: LessonSection[];
  onChange: (sections: LessonSection[]) => void;
}) {
  const nextId = useRef(1);
  const addRef = useRef<HTMLButtonElement>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  function update(id: string, key: "title" | "body", value: string) {
    onChange(
      sections.map((section) =>
        section.id === id ? { ...section, [key]: value } : section,
      ),
    );
  }
  function add() {
    let id = `reading-${nextId.current++}`;
    while (sections.some((section) => section.id === id))
      id = `reading-${nextId.current++}`;
    onChange([...sections, { id, title: "", body: "" }]);
    setStatus(
      `Section ${sections.length + 1} added below. Enter its heading and reading.`,
    );
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const ordered = [...sections];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    onChange(ordered);
    setStatus(`Section moved to position ${target + 1}.`);
  }
  return (
    <section
      className="lesson-editor-group"
      aria-labelledby="reading-sections-heading"
    >
      <div className="lesson-editor-heading">
        <div>
          <p className="eyebrow">02 · Reading</p>
          <h3 id="reading-sections-heading">
            Build the lesson, one section at a time
          </h3>
          <p className="muted">
            Learners read these in order. Each section needs a heading and
            reading.
          </p>
        </div>
      </div>
      <ol className="lesson-section-list">
        {sections.map((section, index) => (
          <li className="lesson-section-editor" key={section.id}>
            <div className="lesson-editor-heading">
              <strong>Section {index + 1}</strong>
              <div className="lesson-editor-actions">
                <button
                  type="button"
                  className="icon-button"
                  disabled={index === 0}
                  aria-label={`Move section ${index + 1} up`}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  disabled={index === sections.length - 1}
                  aria-label={`Move section ${index + 1} down`}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  disabled={sections.length === 1}
                  aria-label={`Remove section ${index + 1}`}
                  onClick={() => setRemoving(section.id)}
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
            <label className="field">
              Section heading
              <InputField
                required
                maxLength={100}
                value={section.title}
                onChange={(event) =>
                  update(section.id, "title", event.target.value)
                }
                placeholder="For example, Notice your neighbour"
              />
            </label>
            <label className="field">
              Reading
              <TextAreaField
                className="teacher-reading-input"
                required
                rows={6}
                maxLength={6000}
                value={section.body}
                onChange={(event) =>
                  update(section.id, "body", event.target.value)
                }
                placeholder="Explain the passage and connect it to everyday life."
              />
            </label>
            {removing === section.id && (
              <div className="lesson-discard">
                <p>Remove section {index + 1} and its reading?</p>
                <div className="lesson-editor-actions">
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => setRemoving(null)}
                  >
                    Keep section
                  </button>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => {
                      onChange(
                        sections.filter((item) => item.id !== section.id),
                      );
                      setRemoving(null);
                      setStatus("Section removed from this draft.");
                      addRef.current?.focus();
                    }}
                  >
                    Remove section
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>
      <button
        ref={addRef}
        type="button"
        className="button button-outline"
        disabled={sections.length >= 12}
        onClick={add}
      >
        <Plus size={17} aria-hidden="true" />
        Add reading section
      </button>
      <p className="muted teacher-form-note">
        {sections.length} of 12 sections · Keep at least one reading section.
      </p>
      <p className="lesson-editor-status" role="status">
        {status}
      </p>
    </section>
  );
}
