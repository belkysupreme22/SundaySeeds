import { CheckCircle2, CircleAlert, ArrowLeft, Eye } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";
import type { LessonDraft } from "../lessons/types";
import { LessonContentPreview } from "../lessons/LessonPreview";
import {
  getPublicationChecks,
  publicationLabel,
  type LessonPublication,
} from "./publicationModel";
import "./publication.css";

type Action = "publish" | "withdraw" | "archive";
const actionCopy: Record<
  Action,
  { title: string; detail: string; label: string }
> = {
  publish: {
    title: "Publish this version in the simulation?",
    detail:
      "This creates a snapshot of the draft and replaces the active version in this simulation. Later draft edits will not change that snapshot.",
    label: "Confirm simulated publication",
  },
  withdraw: {
    title: "Withdraw the active version?",
    detail:
      "This stops its simulated availability. The snapshot, any draft and course links are kept. No real learner progress is changed.",
    label: "Confirm withdrawal",
  },
  archive: {
    title: "Archive this lesson?",
    detail:
      "This stops simulated availability and prevents editing or publishing until restored. Draft content, version history and course links are kept. No real learner progress is changed.",
    label: "Confirm archive",
  },
};

export function PublicationDialog({
  draft,
  record,
  onPublish,
  onWithdraw,
  onArchive,
  onRestore,
  onEdit,
  onClose,
}: {
  draft: LessonDraft;
  record: LessonPublication;
  onPublish: () => void;
  onWithdraw: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onEdit: () => void;
  onClose: () => void;
  restoreFocus?: () => void;
}) {
  const [confirmation, setConfirmation] = useState<Action | null>(null);
  const [preview, setPreview] = useState<"draft" | number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const checks = getPublicationChecks(draft);
  const issueCount = checks.reduce(
    (count, check) => count + check.issues.length,
    0,
  );
  const current = record.versions.find(
    (version) => version.status === "published",
  );
  const nextVersion =
    Math.max(0, ...record.versions.map((version) => version.number)) + 1;
  const canPublish = record.hasDraft && !record.archived && issueCount === 0;
  const previewContent =
    preview === "draft"
      ? draft
      : record.versions.find((version) => version.number === preview)?.lesson;

  function ask(action: Action, event: MouseEvent<HTMLButtonElement>) {
    triggerRef.current = event.currentTarget;
    setConfirmation(action);
  }
  function cancel() {
    setConfirmation(null);
    triggerRef.current?.focus();
  }
  function confirm() {
    if (confirmation === "publish" && canPublish) onPublish();
    else if (confirmation === "withdraw" && current && !record.archived)
      onWithdraw();
    else if (confirmation === "archive" && !record.archived) onArchive();
    setConfirmation(null);
    titleRef.current?.focus();
  }

  return (
    <article
      className="publication-studio"
      aria-labelledby="publication-title"
      onKeyDown={(event) => {
        if (event.key === "Escape" && confirmation) {
          event.preventDefault();
          cancel();
        }
      }}
    >
      <header className="publication-header">
        <div>
          <p className="eyebrow">Publication desk</p>
          <h2 id="publication-title" ref={titleRef} tabIndex={-1}>
            {draft.title || "Untitled lesson"}
          </h2>
          <p className="muted">
            Review readiness, compare versions and prepare the next edition.
          </p>
        </div>
        <button className="button button-outline" onClick={onClose}>
          <ArrowLeft size={18} aria-hidden="true" /> Back to studio
        </button>
      </header>
      <div className="publication-notice">
        <strong>Simulation</strong>
        <p>
          No learners receive this content. Publication state and snapshots
          reset when the page refreshes.
        </p>
      </div>
      <div className="publication-status" role="status">
        <span className="badge">{publicationLabel(record)}</span>
        <span className="muted">
          {record.versions.length}{" "}
          {record.versions.length === 1 ? "version" : "versions"} in history
        </span>
      </div>
      <section
        className="publication-section"
        aria-labelledby="publication-readiness"
      >
        <div className="publication-section-heading">
          <h3 id="publication-readiness">Draft readiness</h3>
          <span>
            {issueCount
              ? `${issueCount} ${issueCount === 1 ? "issue" : "issues"} to resolve`
              : "Ready for review"}
          </span>
        </div>
        <ul className="publication-checks">
          {checks.map((check) => (
            <li
              key={check.id}
              className={
                check.issues.length
                  ? "publication-check needs-attention"
                  : "publication-check"
              }
            >
              {check.issues.length ? (
                <CircleAlert size={21} aria-hidden="true" />
              ) : (
                <CheckCircle2 size={21} aria-hidden="true" />
              )}
              <div>
                <strong>{check.title}</strong>
                <p className="muted">{check.detail}</p>
                {check.issues.length > 0 && (
                  <ul>
                    {check.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <div className="publication-actions">
        <button
          className="button button-outline"
          onClick={() => setPreview(preview === "draft" ? null : "draft")}
          aria-pressed={preview === "draft"}
        >
          <Eye size={18} aria-hidden="true" />
          View {record.hasDraft ? "draft" : "latest content"}
        </button>
        {!record.archived && (
          <button className="button button-outline" onClick={onEdit}>
            {record.hasDraft ? "Edit draft" : "Create next draft"}
          </button>
        )}
        {record.hasDraft && !record.archived && (
          <button
            className="button button-primary"
            disabled={!canPublish}
            onClick={(event) => ask("publish", event)}
          >
            Simulate publishing v{nextVersion}
          </button>
        )}
        {record.archived ? (
          <button
            className="button button-primary"
            onClick={() => {
              onRestore();
              titleRef.current?.focus();
            }}
          >
            Restore to draft
          </button>
        ) : (
          <>
            {current && (
              <button
                className="button button-outline"
                onClick={(event) => ask("withdraw", event)}
              >
                Withdraw active version
              </button>
            )}
            <button
              className="button button-outline"
              onClick={(event) => ask("archive", event)}
            >
              Archive lesson
            </button>
          </>
        )}
      </div>
      {record.archived && (
        <p className="muted">
          Restore to continue editing. Restoring creates a draft; it does not
          republish a version.
        </p>
      )}
      {confirmation && (
        <section
          className="publication-confirm"
          role="group"
          aria-labelledby="publication-confirm-title"
        >
          <h3 id="publication-confirm-title">
            {actionCopy[confirmation].title}
          </h3>
          <p>{actionCopy[confirmation].detail}</p>
          <div className="publication-actions">
            <button
              autoFocus
              className="button button-outline"
              onClick={cancel}
            >
              Cancel
            </button>
            <button className="button button-primary" onClick={confirm}>
              {actionCopy[confirmation].label}
            </button>
          </div>
        </section>
      )}
      <section
        className="publication-section"
        aria-labelledby="publication-history"
      >
        <h3 id="publication-history">Version history</h3>
        {record.versions.length ? (
          <ol className="publication-history">
            {[...record.versions]
              .sort((a, b) => b.number - a.number)
              .map((version) => (
                <li key={version.number}>
                  <div>
                    <strong>Version {version.number}</strong>
                    <span className="muted">
                      {version.status === "published"
                        ? record.archived
                          ? "Archived · unavailable"
                          : "Active in simulation"
                        : version.status === "superseded"
                          ? "Replaced by a newer version"
                          : "Withdrawn"}
                    </span>
                  </div>
                  <button
                    className="button button-outline"
                    aria-pressed={preview === version.number}
                    onClick={() =>
                      setPreview(
                        preview === version.number ? null : version.number,
                      )
                    }
                  >
                    View v{version.number}
                  </button>
                </li>
              ))}
          </ol>
        ) : (
          <p className="muted">
            Your first publication will appear here as a fixed snapshot.
          </p>
        )}
      </section>
      {previewContent && (
        <section
          className="publication-preview"
          aria-label={
            preview === "draft"
              ? "Draft content preview"
              : `Version ${preview} content preview`
          }
        >
          <div className="publication-section-heading">
            <h3>
              {preview === "draft"
                ? record.hasDraft
                  ? "Draft preview"
                  : "Latest content"
                : `Version ${preview} snapshot`}
            </h3>
            <button
              className="button button-outline"
              onClick={() => setPreview(null)}
            >
              Hide content
            </button>
          </div>
          {previewContent.example && (
            <p className="eyebrow">Sample lesson content</p>
          )}
          <LessonContentPreview
            key={preview ?? "none"}
            content={previewContent}
          />
        </section>
      )}
    </article>
  );
}
