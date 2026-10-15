import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, BookOpen, Lightbulb, X } from "lucide-react";
import { useRef, useState } from "react";
import type { LessonContent, LessonDraft } from "./types";
import { QuizPreview } from "../quizzes/QuizPreview";
import "./lesson-preview.css";

export function LessonContentPreview({ content }: { content: LessonContent }) {
  const [position, setPosition] = useState({
    id: content.sections[0]?.id,
    index: 0,
  });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const selectedIndex = content.sections.findIndex(
    (section) => section.id === position.id,
  );
  const index =
    selectedIndex >= 0
      ? selectedIndex
      : Math.max(0, Math.min(position.index, content.sections.length - 1));
  const section = content.sections[index];
  const outcomes = content.outcomes.filter((outcome) => outcome.trim());
  const isLastSection = index === content.sections.length - 1;

  function changeSection(nextIndex: number) {
    const nextSection = content.sections[nextIndex];
    if (!nextSection) return;
    setPosition({ id: nextSection.id, index: nextIndex });
    headingRef.current?.focus();
  }

  return (
    <div className="lesson-content-preview">
      {content.image && (
        <figure className="lesson-preview-image">
          <img src={content.image.src} alt={content.image.alt} />
        </figure>
      )}
      <header className="lesson-preview-introduction">
        <h2>{content.title.trim() || "Untitled lesson"}</h2>
        {content.scripture.trim() ? (
          <p className="teacher-scripture">
            <BookOpen size={18} aria-hidden="true" />
            {content.scripture}
          </p>
        ) : (
          <p className="muted lesson-preview-empty">
            Add a scripture reference to introduce the reading.
          </p>
        )}
      </header>
      <section className="lesson-preview-outcomes">
        <h3>What you’ll learn</h3>
        {outcomes.length ? (
          <ul>
            {outcomes.map((outcome, outcomeIndex) => (
              <li key={outcomeIndex}>
                <Lightbulb size={19} aria-hidden="true" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted lesson-preview-empty">
            Add learning outcomes to show what this lesson will help learners
            understand.
          </p>
        )}
      </section>
      {section ? (
        <>
          <section
            className="lesson-preview-section"
            aria-label="Lesson reading"
          >
            <p className="eyebrow">Reading · Section {index + 1}</p>
            <h3 ref={headingRef} tabIndex={-1}>
              {section.title.trim() || `Section ${index + 1}`}
            </h3>
            {section.body.trim() ? (
              <div className="lesson-preview-body">{section.body}</div>
            ) : (
              <p className="muted lesson-preview-empty">
                This section is waiting for its reading. Add text in the editor
                to see it here.
              </p>
            )}
          </section>
          {isLastSection && (
            <section className="lesson-preview-reflection">
              <p className="eyebrow">Take a moment</p>
              <h3>Reflect on this lesson</h3>
              {content.reflection.trim() ? (
                <p>{content.reflection}</p>
              ) : (
                <p className="muted">
                  Add a reflection question to connect this lesson with everyday
                  life.
                </p>
              )}
            </section>
          )}
          <nav
            className="lesson-preview-navigation"
            aria-label="Reading sections"
          >
            <button
              className="button lesson-preview-nav-button"
              type="button"
              disabled={index === 0}
              onClick={() => changeSection(index - 1)}
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Previous
            </button>
            <span role="status" aria-live="polite">
              Section {index + 1} of {content.sections.length}
            </span>
            <button
              className="button lesson-preview-nav-button"
              type="button"
              disabled={isLastSection}
              onClick={() => changeSection(index + 1)}
            >
              Next
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </nav>
        </>
      ) : (
        <section className="lesson-preview-section">
          <h3>Your reading starts here</h3>
          <p className="muted lesson-preview-empty">
            Add a reading section in the editor. Learners will move through your
            sections in the order you choose.
          </p>
        </section>
      )}
      {Boolean(content.quiz?.length) && (
        <div hidden={Boolean(section) && !isLastSection}>
          <QuizPreview questions={content.quiz ?? []} />
        </div>
      )}
    </div>
  );
}

interface LessonPreviewProps {
  draft: LessonDraft;
  example: boolean;
  onClose: () => void;
  restoreFocus: () => void;
}

export function LessonPreview({
  draft,
  example,
  onClose,
  restoreFocus,
}: LessonPreviewProps) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="dialog-content teacher-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restoreFocus();
          }}
        >
          <div className="dialog-header">
            <div>
              <p className="eyebrow">
                {example ? "Example content" : "Lesson draft"}
              </p>
              <Dialog.Title>Learner preview</Dialog.Title>
            </div>
            <Dialog.Close
              className="icon-button"
              aria-label="Close lesson preview"
            >
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="muted teacher-dialog-description">
            Read the lesson as a learner, from its learning outcomes to the
            final reflection.
          </Dialog.Description>
          <LessonContentPreview content={draft} />
          <div className="dialog-actions">
            <Dialog.Close className="button button-primary">Done</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
