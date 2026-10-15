import { BookOpen, ClipboardCheck, Eye, FilePenLine } from "lucide-react";
import type { LessonDraft } from "./types";
import {
  publicationLabel,
  type LessonPublication,
} from "../publication/publicationModel";

interface LessonDraftListProps {
  drafts: LessonDraft[];
  getPublication: (id: string) => LessonPublication;
  onCreate: (trigger: HTMLButtonElement) => void;
  onEdit: (draft: LessonDraft, trigger: HTMLButtonElement) => void;
  onPreview: (draft: LessonDraft, trigger: HTMLButtonElement) => void;
  onReview: (draft: LessonDraft, trigger: HTMLButtonElement) => void;
}

export function LessonDraftList({
  drafts,
  getPublication,
  onCreate,
  onEdit,
  onPreview,
  onReview,
}: LessonDraftListProps) {
  if (!drafts.length)
    return (
      <div className="panel empty-state teacher-empty">
        <span className="teacher-icon-tile tone-mint">
          <BookOpen aria-hidden="true" size={25} />
        </span>
        <h3>Your first lesson starts here</h3>
        <p className="muted">
          Bring a passage, an idea and a little curiosity. Your drafts will
          appear here.
        </p>
        <button
          className="button button-outline"
          onClick={(event) => onCreate(event.currentTarget)}
        >
          Create a lesson
        </button>
      </div>
    );
  return (
    <div className="teacher-draft-list">
      {drafts.map((draft) => {
        const publication = getPublication(draft.id);
        return (
          <article className="panel teacher-draft" key={draft.id}>
            <span className="teacher-icon-tile tone-lavender">
              <BookOpen size={23} aria-hidden="true" />
            </span>
            <div className="teacher-draft-copy">
              <h3>{draft.title}</h3>
              <p className="muted">
                {draft.scripture || "Scripture not added"}
              </p>
              <span className="badge">
                {draft.example ? "Example · " : ""}
                {publicationLabel(publication)}
              </span>
            </div>
            <div className="teacher-draft-actions">
              <button
                className="button button-outline"
                aria-label={`Review publication for ${draft.title}`}
                onClick={(event) => onReview(draft, event.currentTarget)}
              >
                <ClipboardCheck size={17} aria-hidden="true" />
                Publication
              </button>
              <button
                className="button button-outline"
                aria-label={`Preview ${draft.title}`}
                onClick={(event) => onPreview(draft, event.currentTarget)}
              >
                <Eye size={17} aria-hidden="true" />
                Preview
              </button>
              <button
                className="icon-button"
                disabled={publication.archived}
                aria-label={`Edit ${draft.title}`}
                onClick={(event) => onEdit(draft, event.currentTarget)}
              >
                <FilePenLine size={19} aria-hidden="true" />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
